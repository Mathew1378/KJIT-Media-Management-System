export interface ReportFieldConfig {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'table' | 'photos';
  required: boolean;
  autoFillKey?: string; // Key in Event/User object to auto-fill
  placeholder?: string;
  description?: string;
  tableColumns?: { key: string; label: string; type: 'text' | 'number' }[];
}

export interface ReportFormatConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: ReportFieldConfig[];
}

export const REPORT_FORMATS: ReportFormatConfig[] = [
  {
    id: 'Format1_Standard',
    name: 'Format 1: Standard Event Report',
    category: 'General Academic',
    description: 'Comprehensive report format for standard department events, seminars, and meetings.',
    fields: [
      { id: 'eventName', label: 'Event Title', type: 'text', required: true, autoFillKey: 'name' },
      { id: 'category', label: 'Event Category', type: 'text', required: true, autoFillKey: 'category' },
      { id: 'dateTime', label: 'Date & Time', type: 'text', required: true, autoFillKey: 'dateTime' },
      { id: 'venue', label: 'Venue', type: 'text', required: true, autoFillKey: 'venue' },
      { id: 'organizerName', label: 'Faculty Coordinator', type: 'text', required: true, autoFillKey: 'createdByName' },
      { id: 'objective', label: 'Event Objective', type: 'textarea', required: true, placeholder: 'State the primary objectives of organizing this event...' },
      { id: 'targetAudience', label: 'Target Audience & Count', type: 'text', required: true, autoFillKey: 'expectedAudience' },
      { id: 'writeup', label: 'Detailed Event Narrative (Write-up)', type: 'textarea', required: true, placeholder: 'Detailed chronological account of key discussions, speeches, and sessions...' },
      { id: 'outcome', label: 'Key Outcomes & Takeaways', type: 'textarea', required: true, placeholder: 'Expected and achieved learning outcomes...' },
      {
        id: 'participants',
        label: 'Participant Attendance Details',
        type: 'table',
        required: true,
        tableColumns: [
          { key: 'slNo', label: 'Sl. No.', type: 'number' },
          { key: 'regNo', label: 'Reg. / Employee ID', type: 'text' },
          { key: 'name', label: 'Participant Name', type: 'text' },
          { key: 'dept', label: 'Department / Org', type: 'text' },
          { key: 'designation', label: 'Student / Faculty', type: 'text' },
        ],
      },
      { id: 'feedbackSummary', label: 'Feedback Summary & Analysis', type: 'textarea', required: false, placeholder: 'Optional: Brief summary of participant feedback rating and suggestions' },
      { id: 'websiteUrl', label: 'Website / Portal Link', type: 'text', required: false, placeholder: 'Optional: https://kristujayanti.edu.in/...' },
      { id: 'socialMediaLink', label: 'Social Media Coverage Link', type: 'text', required: false, placeholder: 'Optional: Instagram/LinkedIn post link' },
      { id: 'photos', label: 'Geotagged & Selected Event Photos', type: 'photos', required: true },
    ],
  },
  {
    id: 'Format2_Workshop',
    name: 'Format 2: Technical Workshop / Hands-on Training Report',
    category: 'Technical & Practical',
    description: 'Tailored for skill development workshops, coding bootcamps, and technical labs.',
    fields: [
      { id: 'eventName', label: 'Workshop Title', type: 'text', required: true, autoFillKey: 'name' },
      { id: 'dateTime', label: 'Date & Duration', type: 'text', required: true, autoFillKey: 'dateTime' },
      { id: 'venue', label: 'Lab / Venue', type: 'text', required: true, autoFillKey: 'venue' },
      { id: 'resourcePerson', label: 'Resource Person / Trainer', type: 'text', required: true, autoFillKey: 'chiefGuest' },
      { id: 'softwareTools', label: 'Tools & Technologies Covered', type: 'text', required: true, placeholder: 'e.g. Python, TensorFlow, React, Docker' },
      { id: 'objective', label: 'Workshop Objective', type: 'textarea', required: true },
      { id: 'writeup', label: 'Hands-on Session Overview', type: 'textarea', required: true },
      { id: 'outcome', label: 'Technical Competency Achieved', type: 'textarea', required: true },
      {
        id: 'participants',
        label: 'Trainee Participant List',
        type: 'table',
        required: true,
        tableColumns: [
          { key: 'slNo', label: 'Sl.', type: 'number' },
          { key: 'name', label: 'Student Name', type: 'text' },
          { key: 'class', label: 'Class / Sec', type: 'text' },
          { key: 'githubRepo', label: 'Project / GitHub Link (Optional)', type: 'text' },
        ],
      },
      { id: 'feedbackSummary', label: 'Participant Feedback Score (%)', type: 'text', required: false },
      { id: 'photos', label: 'Workshop Photos with Captions', type: 'photos', required: true },
    ],
  },
  {
    id: 'Format3_Conference',
    name: 'Format 3: Academic Conference / Symposium Report',
    category: 'Research & Scholarly',
    description: 'Designed for National and International conferences, research paper presentations, and symposia.',
    fields: [
      { id: 'eventName', label: 'Conference Title', type: 'text', required: true, autoFillKey: 'name' },
      { id: 'dateTime', label: 'Conference Dates', type: 'text', required: true, autoFillKey: 'dateTime' },
      { id: 'venue', label: 'Auditorium / Venue', type: 'text', required: true, autoFillKey: 'venue' },
      { id: 'chiefGuest', label: 'Chief Guest / Keynote Speaker', type: 'text', required: true, autoFillKey: 'chiefGuest' },
      { id: 'tracks', label: 'Conference Tracks / Sub-themes', type: 'textarea', required: true, placeholder: 'List main tracks (e.g. AI/ML, Cloud Computing, Cybersecurity)' },
      { id: 'papersReceived', label: 'Total Papers Submitted / Accepted', type: 'text', required: true, placeholder: 'e.g. 45 Received / 28 Accepted' },
      { id: 'objective', label: 'Conference Scope & Vision', type: 'textarea', required: true },
      { id: 'writeup', label: 'Keynote & Session Summary', type: 'textarea', required: true },
      { id: 'outcome', label: 'Proceedings & Publication Outcome', type: 'textarea', required: true },
      {
        id: 'presentedPapers',
        label: 'Presented Papers & Authors',
        type: 'table',
        required: true,
        tableColumns: [
          { key: 'paperId', label: 'Paper ID', type: 'text' },
          { key: 'title', label: 'Paper Title', type: 'text' },
          { key: 'authors', label: 'Author(s) Name', type: 'text' },
          { key: 'institution', label: 'Institution / College', type: 'text' },
        ],
      },
      { id: 'isbnNumber', label: 'ISBN / Publisher Details', type: 'text', required: false },
      { id: 'photos', label: 'Conference Photos', type: 'photos', required: true },
    ],
  },
  {
    id: 'Format4_Cultural',
    name: 'Format 4: Cultural & Fest Event Report',
    category: 'Cultural & Extra-Curricular',
    description: 'Tailored for inter-collegiate fests, cultural nights, music/dance events, and art exhibitions.',
    fields: [
      { id: 'eventName', label: 'Fest / Event Title', type: 'text', required: true, autoFillKey: 'name' },
      { id: 'dateTime', label: 'Date', type: 'text', required: true, autoFillKey: 'dateTime' },
      { id: 'venue', label: 'Stage / Venue', type: 'text', required: true, autoFillKey: 'venue' },
      { id: 'participatingColleges', label: 'Participating Institutions Count', type: 'text', required: true, placeholder: 'e.g. 15 Colleges, 320 Participants' },
      { id: 'objective', label: 'Event Objective', type: 'textarea', required: true },
      { id: 'writeup', label: 'Fest Highlights & Performances', type: 'textarea', required: true },
      { id: 'outcome', label: 'Overall Champions & Placement', type: 'textarea', required: true },
      {
        id: 'winners',
        label: 'Event Winners & Prize List',
        type: 'table',
        required: true,
        tableColumns: [
          { key: 'eventSub', label: 'Sub-Event / Category', type: 'text' },
          { key: 'position', label: '1st / 2nd / 3rd Prize', type: 'text' },
          { key: 'winnerName', label: 'Winner Name', type: 'text' },
          { key: 'college', label: 'College / Department', type: 'text' },
        ],
      },
      { id: 'photos', label: 'Cultural Highlights Photos', type: 'photos', required: true },
    ],
  },
  {
    id: 'Format5_GuestLecture',
    name: 'Format 5: Guest Lecture / Expert Talk Report',
    category: 'Guest Speakers',
    description: 'Standard format for industry talks, guest lectures, expert interactions, and webinars.',
    fields: [
      { id: 'eventName', label: 'Lecture Title', type: 'text', required: true, autoFillKey: 'name' },
      { id: 'dateTime', label: 'Date & Time', type: 'text', required: true, autoFillKey: 'dateTime' },
      { id: 'venue', label: 'Venue / Platform', type: 'text', required: true, autoFillKey: 'venue' },
      { id: 'speakerName', label: 'Guest Speaker Name', type: 'text', required: true, autoFillKey: 'chiefGuest' },
      { id: 'speakerOrg', label: 'Speaker Designation & Organization', type: 'text', required: true, placeholder: 'e.g. Senior Architect, Microsoft' },
      { id: 'objective', label: 'Lecture Objective', type: 'textarea', required: true },
      { id: 'writeup', label: 'Topic Overview & Interactive Session', type: 'textarea', required: true },
      { id: 'outcome', label: 'Industry Insights Gained', type: 'textarea', required: true },
      {
        id: 'participants',
        label: 'Attendee Summary Table',
        type: 'table',
        required: true,
        tableColumns: [
          { key: 'slNo', label: 'Sl.', type: 'number' },
          { key: 'name', label: 'Student / Faculty', type: 'text' },
          { key: 'dept', label: 'Department', type: 'text' },
        ],
      },
      { id: 'mementoDetails', label: 'Memento / Vote of Thanks Details', type: 'text', required: false },
      { id: 'photos', label: 'Lecture Photos', type: 'photos', required: true },
    ],
  },
  {
    id: 'Format6_Sports',
    name: 'Format 6: Sports Tournament & Athletic Event Report',
    category: 'Sports & Wellness',
    description: 'Format for intra/inter-department sports competitions, annual athletic meets, and tournaments.',
    fields: [
      { id: 'eventName', label: 'Tournament Name', type: 'text', required: true, autoFillKey: 'name' },
      { id: 'dateTime', label: 'Dates', type: 'text', required: true, autoFillKey: 'dateTime' },
      { id: 'venue', label: 'Ground / Court / Stadium', type: 'text', required: true, autoFillKey: 'venue' },
      { id: 'sportsCategory', label: 'Sport Type', type: 'text', required: true, placeholder: 'e.g. Football, Basketball, Track & Field' },
      { id: 'teamsCount', label: 'Participating Teams / Athletes', type: 'text', required: true },
      { id: 'objective', label: 'Sports Objective', type: 'textarea', required: true },
      { id: 'writeup', label: 'Match Highlights & Finals', type: 'textarea', required: true },
      { id: 'outcome', label: 'Sportsmanship & Records Broken', type: 'textarea', required: true },
      {
        id: 'matchResults',
        label: 'Tournament Results & Winners Table',
        type: 'table',
        required: true,
        tableColumns: [
          { key: 'category', label: 'Men / Women / Category', type: 'text' },
          { key: 'position', label: 'Winner / Runner-Up', type: 'text' },
          { key: 'teamName', label: 'Team / Student Name', type: 'text' },
          { key: 'score', label: 'Final Score / Timing', type: 'text' },
        ],
      },
      { id: 'photos', label: 'Sports Action Photos', type: 'photos', required: true },
    ],
  },
  {
    id: 'Format7_Extension',
    name: 'Format 7: Community Extension & Outreach Program Report',
    category: 'Social Responsibility',
    description: 'Tailored for NSS, NCC, Unnat Bharat Abhiyan, community drives, and social service initiatives.',
    fields: [
      { id: 'eventName', label: 'Outreach Program Title', type: 'text', required: true, autoFillKey: 'name' },
      { id: 'dateTime', label: 'Date', type: 'text', required: true, autoFillKey: 'dateTime' },
      { id: 'venue', label: 'Village / Location / School', type: 'text', required: true, autoFillKey: 'venue' },
      { id: 'collaboratingAgency', label: 'Collaborating NGO / UBA Cell', type: 'text', required: true, placeholder: 'e.g. UBA Unit KJIT, Local Village Panchayat' },
      { id: 'beneficiaryCount', label: 'Number of Community Beneficiaries', type: 'number', required: true, placeholder: 'e.g. 150 Village Residents' },
      { id: 'objective', label: 'Social & Community Objective', type: 'textarea', required: true },
      { id: 'writeup', label: 'Activities Executed on Field', type: 'textarea', required: true },
      { id: 'outcome', label: 'Community Impact & Awareness Achieved', type: 'textarea', required: true },
      {
        id: 'studentVolunteers',
        label: 'Student Volunteers List',
        type: 'table',
        required: true,
        tableColumns: [
          { key: 'slNo', label: 'Sl.', type: 'number' },
          { key: 'name', label: 'Volunteer Name', type: 'text' },
          { key: 'regNo', label: 'Reg No.', type: 'text' },
          { key: 'hoursSpent', label: 'Volunteering Hours', type: 'text' },
        ],
      },
      { id: 'panchayatLetterRef', label: 'Panchayat / School Acknowledgment Ref No.', type: 'text', required: false },
      { id: 'photos', label: 'Field Action & Community Photos', type: 'photos', required: true },
    ],
  },
  {
    id: 'Format8_Executive',
    name: 'Format 8: Executive Summary & Department Leadership Brief',
    category: 'Management Brief',
    description: 'High-level executive report for Deans, Management, and Board of Governors review.',
    fields: [
      { id: 'eventName', label: 'Strategic Event / Initiative Name', type: 'text', required: true, autoFillKey: 'name' },
      { id: 'dateTime', label: 'Execution Period', type: 'text', required: true, autoFillKey: 'dateTime' },
      { id: 'venue', label: 'Location / Campus', type: 'text', required: true, autoFillKey: 'venue' },
      { id: 'executiveSummary', label: 'Executive Summary', type: 'textarea', required: true, placeholder: 'High level summary of the event strategic significance...' },
      { id: 'financialSummary', label: 'Budget & Financial Overview', type: 'textarea', required: true, placeholder: 'Total Expenditure, Sponsoring Bodies, Management Contribution...' },
      { id: 'objective', label: 'Strategic Alignment', type: 'textarea', required: true },
      { id: 'writeup', label: 'Key Milestones & Deliverables Achieved', type: 'textarea', required: true },
      { id: 'outcome', label: 'Institutional Impact & Future Action Plan', type: 'textarea', required: true },
      {
        id: 'dignitariesTable',
        label: 'VIP & Executive Attendees',
        type: 'table',
        required: true,
        tableColumns: [
          { key: 'name', label: 'Executive Name', type: 'text' },
          { key: 'designation', label: 'Designation', type: 'text' },
          { key: 'org', label: 'Organization / Institution', type: 'text' },
        ],
      },
      { id: 'photos', label: 'High Resolution Event Photographs', type: 'photos', required: true },
    ],
  },
];
