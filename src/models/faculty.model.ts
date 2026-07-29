import { Schema, model, Document } from 'mongoose';

export interface IMinimumDegree {
  year: number;
  section: 'science_nature' | 'science_math' | 'literary';
  maxScore: number;
  minimumDegree: number;
  minimumPercent: number;
}

export interface IFaculty extends Document {
  faculty: string;
  university: string;
  city: string;
  category: 'Medical' | 'Engineering' | 'ComputerScience' | 'Humanities' | 'Business' | 'Science';
  educationType: 'حكومي' | 'أهلية' | 'خاص';
  duration: number;
  description: string;
  website: string;
  availableSections: ('science_nature' | 'science_math' | 'literary')[];
  career_opportunities: string[];
  minimumDegrees: IMinimumDegree[];
}

const MinimumDegreeSchema = new Schema<IMinimumDegree>({
  year: { type: Number, required: true },
  section: { 
    type: String, 
    enum: ['science_nature', 'science_math', 'literary'], 
    required: true 
  },
  maxScore: { type: Number, required: true },
  minimumDegree: { type: Number, required: true },
  minimumPercent: { type: Number, required: true }
}, { _id: false });

const FacultySchema = new Schema<IFaculty>({
  faculty: { type: String, required: true },
  university: { type: String, required: true },
  city: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Medical', 'Engineering', 'ComputerScience', 'Humanities', 'Business', 'Science'], 
    required: true 
  },
  educationType: { 
    type: String, 
    enum: ['حكومي', 'أهلية', 'خاص'], 
    required: true 
  },
  duration: { type: Number, required: true },
  description: { type: String, required: true },
  website: { type: String, required: true },
  availableSections: [{ 
    type: String, 
    enum: ['science_nature', 'science_math', 'literary'] 
  }],
  career_opportunities: [{ type: String }],
  minimumDegrees: [MinimumDegreeSchema]
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      const r = ret as any;
      delete r._id;
      delete r.__v;
      return r;
    }
  }
});

// Add text index for searching
FacultySchema.index({ faculty: 'text', university: 'text', city: 'text', description: 'text' });

export const Faculty = model<IFaculty>('Faculty', FacultySchema);
