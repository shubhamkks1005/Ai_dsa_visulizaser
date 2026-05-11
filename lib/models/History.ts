import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHistory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  language: string;
  originalCode: string;
  generatedHTML: string;
  createdAt: Date;
}

const HistorySchema = new Schema<IHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    originalCode: {
      type: String,
      required: true,
    },
    generatedHTML: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure indexes for performance
HistorySchema.index({ userId: 1, createdAt: -1 });

const History: Model<IHistory> =
  mongoose.models.History || mongoose.model<IHistory>("History", HistorySchema);

export default History;