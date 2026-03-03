const pdfParse   = require('pdf-parse');
const stringSimilarity = require('string-similarity');
const Submission = require('../models/Submission');

/**
 * Extract text from PDF buffer
 */
const extractText = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch {
    return '';
  }
};

/**
 * Run plagiarism check against all existing submissions for the same assignment.
 * Updates the submission's plagiarismScore (0-100).
 */
const checkPlagiarism = async (submissionId, pdfBuffer, assignmentId) => {
  try {
    const newText = await extractText(pdfBuffer);
    if (!newText.trim()) return;

    // Get all other submissions for the same assignment
    const others = await Submission.find({
      assignment: assignmentId,
      _id: { $ne: submissionId },
    }).select('+extractedText').lean();

    let maxScore = 0;

    for (const other of others) {
      if (!other.extractedText) continue;
      const score = stringSimilarity.compareTwoStrings(
        newText.toLowerCase().trim(),
        other.extractedText.toLowerCase().trim()
      );
      if (score > maxScore) maxScore = score;
    }

    const plagiarismScore = Math.round(maxScore * 100);

    await Submission.findByIdAndUpdate(submissionId, {
      plagiarismScore,
      extractedText: newText.slice(0, 10000), // store first 10K chars
    });
  } catch (err) {
    console.error('Plagiarism check error:', err.message);
  }
};

module.exports = { extractText, checkPlagiarism };
