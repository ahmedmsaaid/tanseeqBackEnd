import { Request, Response } from 'express';
import { Faculty } from '../models/faculty.model';
import mongoose from 'mongoose';
import { facultiesData } from '../data/faculties_data';

// Helper function with higher sensitivity to percentage deltas
function calculateProbability(userPercent: number, weightedCutoff: number): { percent: number; label: string; status: 'high' | 'medium' | 'low' | 'very_low' } {
  const diff = userPercent - weightedCutoff;

  if (diff >= 1.0) {
    return {
      percent: Math.min(99, Math.round(90 + (diff - 1) * 2)),
      label: 'مضمونة جداً 🟢',
      status: 'high'
    };
  } else if (diff >= 0) {
    return {
      percent: Math.round(75 + (diff / 1.0) * 14),
      label: 'مضمونة 🟢',
      status: 'high'
    };
  } else if (diff >= -0.5) {
    return {
      percent: Math.round(50 + ((diff + 0.5) / 0.5) * 24),
      label: 'محتملة (مستهدفة) 🟡',
      status: 'medium'
    };
  } else if (diff >= -2.0) {
    return {
      percent: Math.round(15 + ((diff + 2.0) / 1.5) * 34),
      label: 'صعبة 🔴',
      status: 'low'
    };
  } else {
    return {
      percent: Math.max(1, Math.round(5 + (diff + 2.0) * 0.5)),
      label: 'مستبعدة 🔴',
      status: 'very_low'
    };
  }
}

// 1. Get all faculties
export const getFaculties = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, city, category, educationType, section, limit = 10, page = 1 } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let list = [...facultiesData];
      if (search) {
        const s = (search as string).toLowerCase();
        list = list.filter(f =>
          f.faculty.toLowerCase().includes(s) ||
          f.university.toLowerCase().includes(s) ||
          f.city.toLowerCase().includes(s) ||
          f.description.toLowerCase().includes(s)
        );
      }
      if (city) list = list.filter(f => f.city === city);
      if (category) list = list.filter(f => f.category === category);
      if (educationType) list = list.filter(f => f.educationType === educationType);
      if (section) list = list.filter(f => f.availableSections.includes(section as any));

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const total = list.length;
      const paginated = list.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      res.json({
        success: true,
        data: paginated,
        pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) }
      });
      return;
    }

    const query: any = {};
    if (search) query.$text = { $search: search as string };
    if (city) query.city = city;
    if (category) query.category = category;
    if (educationType) query.educationType = educationType;
    if (section) query.availableSections = section;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const faculties = await Faculty.find(query).skip(skip).limit(limitNum);
    const total = await Faculty.countDocuments(query);

    res.json({
      success: true,
      data: faculties,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get single faculty details
export const getFacultyById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const faculty = facultiesData.find(f => f._id === req.params.id);
      if (!faculty) {
        res.status(404).json({ success: false, message: 'Faculty not found' });
        return;
      }
      res.json({ success: true, data: faculty });
      return;
    }

    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      res.status(404).json({ success: false, message: 'Faculty not found' });
      return;
    }
    res.json({ success: true, data: faculty });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Predict Acceptance
export const predictAcceptance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { score, maxScore = 320, section, cities, categories, educationTypes } = req.body;

    if (score === undefined || !section) {
      res.status(400).json({ success: false, message: 'score and section are required parameters' });
      return;
    }

    const userPercent = (score / maxScore) * 100;

    const processFacultyPrediction = (fac: any) => {
      const degree2024 = fac.minimumDegrees.find((d: any) => d.year === 2024 && d.section === section);
      const degree2025 = fac.minimumDegrees.find((d: any) => d.year === 2025 && d.section === section);

      const p2024 = degree2024?.minimumPercent;
      const p2025 = degree2025?.minimumPercent;

      let weightedCutoff = 0;
      if (p2025 !== undefined && p2024 !== undefined) {
        weightedCutoff = p2025 * 0.6 + p2024 * 0.4;
      } else if (p2025 !== undefined) {
        weightedCutoff = p2025;
      } else if (p2024 !== undefined) {
        weightedCutoff = p2024;
      }

      const prediction2024 = p2024 !== undefined ? calculateProbability(userPercent, p2024) : null;
      const prediction2025 = p2025 !== undefined ? calculateProbability(userPercent, p2025) : null;
      const overallPrediction = weightedCutoff > 0 ? calculateProbability(userPercent, weightedCutoff) : null;

      return {
        faculty: fac.faculty,
        university: fac.university,
        city: fac.city,
        category: fac.category,
        educationType: fac.educationType,
        id: fac._id || fac.id,
        duration: fac.duration,
        website: fac.website,
        userScore: score,
        userPercent: parseFloat(userPercent.toFixed(2)),
        weightedCutoffPercent: parseFloat(weightedCutoff.toFixed(2)),
        cutoffs: {
          y2024: degree2024 ? { degree: degree2024.minimumDegree, percent: degree2024.minimumPercent } : null,
          y2025: degree2025 ? { degree: degree2025.minimumDegree, percent: degree2025.minimumPercent } : null
        },
        predictions: {
          y2024: prediction2024,
          y2025: prediction2025,
          overall: overallPrediction
        }
      };
    };

    if (mongoose.connection.readyState !== 1) {
      let list = facultiesData.filter(fac =>
        fac.availableSections.includes(section as any) &&
        fac.minimumDegrees.some(d => d.section === section)
      );

      if (cities?.length) list = list.filter(f => cities.includes(f.city));
      if (categories?.length) list = list.filter(f => categories.includes(f.category));
      if (educationTypes?.length) list = list.filter(f => educationTypes.includes(f.educationType));

      const results = list.map(processFacultyPrediction);
      results.sort((a, b) => (b.predictions.overall?.percent || 0) - (a.predictions.overall?.percent || 0));

      res.json({ success: true, data: results });
      return;
    }

    const query: any = { availableSections: section, 'minimumDegrees.section': section };
    if (cities?.length) query.city = { $in: cities };
    if (categories?.length) query.category = { $in: categories };
    if (educationTypes?.length) query.educationType = { $in: educationTypes };

    const faculties = await Faculty.find(query);
    const results = faculties.map(processFacultyPrediction);
    results.sort((a, b) => (b.predictions.overall?.percent || 0) - (a.predictions.overall?.percent || 0));

    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Recommend Advisory / Colleges
export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { score, maxScore = 320, section, targetCategory } = req.body;

    if (score === undefined || !section) {
      res.status(400).json({ success: false, message: 'score and section are required parameters' });
      return;
    }

    const userPercent = (score / maxScore) * 100;

    const processItem = (fac: any) => {
      const degree24 = fac.minimumDegrees.find((d: any) => d.year === 2024 && d.section === section);
      const degree25 = fac.minimumDegrees.find((d: any) => d.year === 2025 && d.section === section);
      const cutoff = degree25?.minimumPercent ?? degree24?.minimumPercent ?? 0;
      const prob = calculateProbability(userPercent, cutoff);
      return { faculty: fac, cutoff, prob };
    };

    let mapped: any[] = [];

    if (mongoose.connection.readyState !== 1) {
      let list = facultiesData.filter(fac =>
        fac.availableSections.includes(section as any) &&
        fac.minimumDegrees.some(d => d.section === section)
      );
      if (targetCategory) list = list.filter(f => f.category === targetCategory);
      mapped = list.map(processItem);
    } else {
      const query: any = { availableSections: section, 'minimumDegrees.section': section };
      if (targetCategory) query.category = targetCategory;
      const faculties = await Faculty.find(query);
      mapped = faculties.map(processItem);
    }

    const safety = mapped
      .filter(item => item.prob.percent >= 80)
      .sort((a, b) => b.cutoff - a.cutoff)
      .slice(0, 5)
      .map(item => ({ ...(item.faculty.toJSON ? item.faculty.toJSON() : item.faculty), prediction: item.prob }));

    const match = mapped
      .filter(item => item.prob.percent >= 50 && item.prob.percent < 80)
      .sort((a, b) => b.cutoff - a.cutoff)
      .slice(0, 5)
      .map(item => ({ ...(item.faculty.toJSON ? item.faculty.toJSON() : item.faculty), prediction: item.prob }));

    const reach = mapped
      .filter(item => item.prob.percent >= 15 && item.prob.percent < 50)
      .sort((a, b) => a.cutoff - b.cutoff)
      .slice(0, 5)
      .map(item => ({ ...(item.faculty.toJSON ? item.faculty.toJSON() : item.faculty), prediction: item.prob }));

    res.json({
      success: true,
      data: {
        safety,
        match,
        reach,
        userPercent: parseFloat(userPercent.toFixed(2))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};