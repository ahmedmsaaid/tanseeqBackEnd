import { Request, Response } from 'express';
import { Faculty, IMinimumDegree } from '../models/faculty.model';
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

// 3. Predict Acceptance with Weighted Trend (60% 2025 + 40% 2024)
export const predictAcceptance = async (req: Request, res: Response): Promise<void> => {
  try {
    // Set default maxScore to 320 for current system scale
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

      // Weighted Historical Cutoff Calculation
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

    const query: any = {
      availableSections: section,
      'minimumDegrees.section': section
    };

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