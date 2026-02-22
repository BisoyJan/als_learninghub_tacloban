<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReportController extends Controller
{
    /**
     * Generate a PDF progress report for an enrollment.
     * Uses HTML rendered to a downloadable page.
     */
    public function progressReport(Enrollment $enrollment, Request $request): Response
    {
        $user = $request->user();

        // Authorization: student can only view own, teacher can view own enrollments, admin can view all
        if ($user->isStudent() && $enrollment->student_id !== $user->id) {
            abort(403);
        }

        if ($user->isTeacher() && $enrollment->enrolled_by !== $user->id) {
            abort(403);
        }

        $enrollment->load([
            'student',
            'module.subject',
            'progressRecords.recordedBy',
        ]);

        $centerName = SystemSetting::getValue('center_name', 'Anibong, Tacloban City Learning Center');
        $schoolYear = SystemSetting::getValue('school_year', date('Y') . '-' . (date('Y') + 1));
        $term = SystemSetting::getValue('term', '1st Semester');

        $records = $enrollment->progressRecords->sortBy('recorded_date');
        $averageScore = $enrollment->average_score;

        $html = $this->buildReportHtml($enrollment, $records, $centerName, $schoolYear, $term, $averageScore);

        $filename = 'progress_report_' . str_replace(' ', '_', $enrollment->student->name) . '_' . now()->format('Y-m-d') . '.html';

        return response($html, 200, [
            'Content-Type' => 'text/html',
        ]);
    }

    /**
     * Build printable HTML report.
     */
    private function buildReportHtml(
        Enrollment $enrollment,
        $records,
        string $centerName,
        string $schoolYear,
        string $term,
        ?float $averageScore,
    ): string {
        $student = $enrollment->student;
        $module = $enrollment->module;
        $subject = $module->subject;

        $recordRows = '';
        $index = 1;
        foreach ($records as $record) {
            $score = $record->score !== null
                ? number_format($record->score, 1) . ($record->max_score ? '/' . number_format($record->max_score, 1) : '')
                : '—';
            $percentage = $record->percentage ?? '—';
            $date = $record->recorded_date->format('M d, Y');
            $type = ucfirst($record->type);
            $remarks = e($record->remarks ?? '');

            $recordRows .= <<<ROW
            <tr>
                <td style="padding:8px;border:1px solid #ddd;text-align:center;">{$index}</td>
                <td style="padding:8px;border:1px solid #ddd;">{$record->title}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:center;">{$type}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:center;">{$score}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:center;">{$percentage}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:center;">{$date}</td>
                <td style="padding:8px;border:1px solid #ddd;font-size:12px;">{$remarks}</td>
            </tr>
            ROW;
            $index++;
        }

        if (empty($recordRows)) {
            $recordRows = '<tr><td colspan="7" style="padding:20px;border:1px solid #ddd;text-align:center;color:#999;">No progress records available.</td></tr>';
        }

        $avgDisplay = $averageScore !== null ? number_format($averageScore, 1) . '%' : 'N/A';
        $statusLabel = $enrollment->status_label;
        $enrolledDate = $enrollment->created_at->format('F d, Y');
        $completedDate = $enrollment->completed_at ? $enrollment->completed_at->format('F d, Y') : '—';
        $totalRecords = $records->count();
        $subjectName = $subject ? $subject->name : 'N/A';
        $levelLabel = $module->level_label;
        $printDate = now()->format('F d, Y');

        return <<<HTML
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Progress Report - {$student->name}</title>
            <style>
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; }
                }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px 30px;
                    color: #333;
                    line-height: 1.5;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #2563eb;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    margin: 0;
                    color: #1e40af;
                    font-size: 22px;
                }
                .header h2 {
                    margin: 5px 0 0;
                    color: #64748b;
                    font-size: 14px;
                    font-weight: normal;
                }
                .header h3 {
                    margin: 15px 0 0;
                    font-size: 18px;
                    color: #333;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 30px;
                }
                .info-box {
                    background: #f8fafc;
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }
                .info-box label {
                    font-size: 11px;
                    text-transform: uppercase;
                    color: #94a3b8;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
                .info-box p {
                    margin: 4px 0 0;
                    font-size: 15px;
                    font-weight: 600;
                    color: #1e293b;
                }
                .summary {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-bottom: 30px;
                }
                .summary-card {
                    text-align: center;
                    padding: 15px;
                    background: #f0f9ff;
                    border-radius: 8px;
                    border: 1px solid #bfdbfe;
                }
                .summary-card .value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e40af;
                }
                .summary-card .label {
                    font-size: 11px;
                    color: #64748b;
                    text-transform: uppercase;
                    margin-top: 4px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                }
                th {
                    background: #1e40af;
                    color: white;
                    padding: 10px 8px;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border: 1px solid #1e40af;
                }
                td {
                    font-size: 13px;
                }
                tr:nth-child(even) td {
                    background-color: #f8fafc;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                }
                .signature-line {
                    margin-top: 50px;
                    border-top: 1px solid #333;
                    padding-top: 5px;
                    font-size: 13px;
                }
                .print-btn {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 10px 20px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .print-btn:hover {
                    background: #1d4ed8;
                }
            </style>
        </head>
        <body>
            <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>

            <div class="header">
                <h1>ALS Connect Tacloban</h1>
                <h2>{$centerName}</h2>
                <h3>Learner Progress Report</h3>
                <p style="font-size:13px;color:#64748b;margin-top:5px;">
                    School Year {$schoolYear} &bull; {$term}
                </p>
            </div>

            <div class="info-grid">
                <div class="info-box">
                    <label>Student Name</label>
                    <p>{$student->name}</p>
                </div>
                <div class="info-box">
                    <label>Email</label>
                    <p>{$student->email}</p>
                </div>
                <div class="info-box">
                    <label>Module</label>
                    <p>{$module->title}</p>
                </div>
                <div class="info-box">
                    <label>Subject &amp; Level</label>
                    <p>{$subjectName} &bull; {$levelLabel}</p>
                </div>
                <div class="info-box">
                    <label>Enrollment Date</label>
                    <p>{$enrolledDate}</p>
                </div>
                <div class="info-box">
                    <label>Status</label>
                    <p>{$statusLabel}</p>
                </div>
            </div>

            <div class="summary">
                <div class="summary-card">
                    <div class="value">{$avgDisplay}</div>
                    <div class="label">Average Score</div>
                </div>
                <div class="summary-card">
                    <div class="value">{$totalRecords}</div>
                    <div class="label">Total Records</div>
                </div>
                <div class="summary-card">
                    <div class="value">{$statusLabel}</div>
                    <div class="label">Status</div>
                </div>
                <div class="summary-card">
                    <div class="value">{$completedDate}</div>
                    <div class="label">Completion Date</div>
                </div>
            </div>

            <h3 style="margin-bottom:10px;font-size:16px;">Detailed Progress Records</h3>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Score</th>
                        <th>%</th>
                        <th>Date</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {$recordRows}
                </tbody>
            </table>

            <div class="footer">
                <div>
                    <div class="signature-line">Teacher's Signature</div>
                </div>
                <div>
                    <div class="signature-line">Administrator's Signature</div>
                </div>
            </div>

            <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:30px;">
                Generated from ALS Connect Tacloban on {$printDate}. This is a system-generated report.
            </p>
        </body>
        </html>
        HTML;
    }

    /**
     * Generate a certificate of completion for a completed enrollment.
     */
    public function certificate(Enrollment $enrollment, Request $request): Response
    {
        $user = $request->user();

        // Authorization
        if ($user->isStudent() && $enrollment->student_id !== $user->id) {
            abort(403);
        }

        if ($user->isTeacher() && $enrollment->enrolled_by !== $user->id) {
            abort(403);
        }

        // Only completed enrollments can have certificates
        if ($enrollment->status !== 'completed') {
            abort(403, 'Certificate is only available for completed modules.');
        }

        $enrollment->load(['student', 'module.subject']);

        $centerName = SystemSetting::getValue('center_name', 'Anibong, Tacloban City Learning Center');
        $schoolYear = SystemSetting::getValue('school_year', date('Y') . '-' . (date('Y') + 1));

        $html = $this->buildCertificateHtml($enrollment, $centerName, $schoolYear);

        return response($html, 200, [
            'Content-Type' => 'text/html',
        ]);
    }

    /**
     * Build printable certificate HTML.
     */
    private function buildCertificateHtml(Enrollment $enrollment, string $centerName, string $schoolYear): string
    {
        $student = $enrollment->student;
        $module = $enrollment->module;
        $subject = $module->subject;
        $completedDate = $enrollment->completed_at ? $enrollment->completed_at->format('F d, Y') : now()->format('F d, Y');
        $avgScore = $enrollment->average_score !== null ? number_format($enrollment->average_score, 1) . '%' : 'N/A';
        $subjectName = $subject ? $subject->name : 'General';
        $levelLabel = $module->level_label;
        $printDate = now()->format('F d, Y');

        return <<<HTML
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Certificate - {$student->name}</title>
            <style>
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; }
                    @page { size: landscape; margin: 0; }
                }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Georgia', 'Times New Roman', serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: #f8fafc;
                }
                .certificate {
                    width: 900px;
                    min-height: 640px;
                    background: white;
                    position: relative;
                    padding: 60px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .certificate::before {
                    content: '';
                    position: absolute;
                    inset: 12px;
                    border: 3px solid #1e40af;
                    border-radius: 4px;
                    pointer-events: none;
                }
                .certificate::after {
                    content: '';
                    position: absolute;
                    inset: 18px;
                    border: 1px solid #93c5fd;
                    border-radius: 4px;
                    pointer-events: none;
                }
                .org-name {
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    color: #1e40af;
                    margin-bottom: 4px;
                }
                .center-name {
                    font-size: 12px;
                    color: #64748b;
                    margin-bottom: 25px;
                }
                .title {
                    font-size: 36px;
                    color: #1e40af;
                    font-weight: bold;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 4px;
                }
                .subtitle {
                    font-size: 14px;
                    color: #64748b;
                    margin-bottom: 30px;
                }
                .presented-to {
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: #94a3b8;
                    margin-bottom: 10px;
                }
                .student-name {
                    font-size: 32px;
                    font-weight: bold;
                    color: #0f172a;
                    border-bottom: 2px solid #1e40af;
                    padding-bottom: 6px;
                    margin-bottom: 20px;
                    display: inline-block;
                    min-width: 400px;
                }
                .description {
                    font-size: 15px;
                    color: #475569;
                    line-height: 1.8;
                    max-width: 650px;
                    margin-bottom: 30px;
                }
                .module-name {
                    font-weight: bold;
                    color: #1e40af;
                }
                .details {
                    display: flex;
                    gap: 40px;
                    margin-bottom: 35px;
                }
                .detail-item {
                    font-size: 12px;
                    color: #64748b;
                }
                .detail-item strong {
                    color: #1e293b;
                    font-size: 14px;
                    display: block;
                }
                .signatures {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                    max-width: 600px;
                    margin-top: auto;
                }
                .sig-box {
                    text-align: center;
                }
                .sig-line {
                    width: 200px;
                    border-top: 1px solid #333;
                    margin-top: 50px;
                    padding-top: 5px;
                    font-size: 12px;
                    color: #475569;
                }
                .date-line {
                    font-size: 11px;
                    color: #94a3b8;
                    margin-top: 20px;
                }
                .print-btn {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 10px 20px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-family: sans-serif;
                    z-index: 100;
                }
                .print-btn:hover {
                    background: #1d4ed8;
                }
                .ribbon {
                    position: absolute;
                    top: 30px;
                    right: 30px;
                    font-size: 40px;
                }
            </style>
        </head>
        <body>
            <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>

            <div class="certificate">
                <div class="ribbon">🏅</div>

                <div class="org-name">ALS Connect Tacloban</div>
                <div class="center-name">{$centerName} &bull; S.Y. {$schoolYear}</div>

                <div class="title">Certificate</div>
                <div class="subtitle">of Completion</div>

                <div class="presented-to">This is proudly presented to</div>
                <div class="student-name">{$student->name}</div>

                <div class="description">
                    For successfully completing the learning module
                    <span class="module-name">"{$module->title}"</span>
                    under the <strong>{$subjectName}</strong> subject
                    at the <strong>{$levelLabel}</strong> level
                    with an average score of <strong>{$avgScore}</strong>.
                </div>

                <div class="details">
                    <div class="detail-item">
                        <strong>{$subjectName}</strong>
                        Subject
                    </div>
                    <div class="detail-item">
                        <strong>{$levelLabel}</strong>
                        Level
                    </div>
                    <div class="detail-item">
                        <strong>{$avgScore}</strong>
                        Average Score
                    </div>
                    <div class="detail-item">
                        <strong>{$completedDate}</strong>
                        Date Completed
                    </div>
                </div>

                <div class="signatures">
                    <div class="sig-box">
                        <div class="sig-line">Teacher / Facilitator</div>
                    </div>
                    <div class="sig-box">
                        <div class="sig-line">Administrator / Coordinator</div>
                    </div>
                </div>

                <div class="date-line">
                    Generated on {$printDate} &bull; ALS Connect Tacloban
                </div>
            </div>
        </body>
        </html>
        HTML;
    }
}
