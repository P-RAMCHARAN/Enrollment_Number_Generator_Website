/* ==========================================
   GD GOENKA UNIVERSITY
   ENROLLMENT NUMBER GENERATOR
========================================== */

/* STORAGE KEYS */

const STUDENTS_KEY = "gdGoenkaStudentRecords";
const SETTINGS_KEY = "gdGoenkaEnrollmentSettings";
const COUNTER_KEY = "gdGoenkaEnrollmentCounter";
const ADMIN_CREDENTIALS_KEY = "gdGoenkaAdminCredentials";

/* DEFAULT DATA */

const DEFAULT_COURSES = [
  "B.Tech CSE",
  "B.Tech Civil Engineering",
  "B.Tech ECE",
  "B.Tech CSE - AI & ML",
  "B.Tech AI & Data Science",
  "B.Tech Cyber Security",
  "B.Tech Biotechnology",
  "B.Tech Aerospace",
  "B.Tech Energy",
  "B.Tech Mechanical Engineering (EV)",
  "B.Tech Fire & Safety",
  "B.Tech Environmental (ESG & Sustainability)",
  "B.Tech ECE Biomedical (BOSCH)",
  "B.Tech ECE IoT (BOSCH)",
  "B.Tech ECE VLSI (BOSCH)",
  "B.Tech ECE Quantum Technology",
  "B.Tech CSE Quantum Computing",
  "B.Tech Aerospace with Pilot Pathway",
  "BCA Cyber Security (CompTIA)",
  "BCA AI/ML (Microsoft CloudThat)",
  "BCA Data Science (Microsoft CloudThat)"
];

const DEFAULT_YEARS = [
  "2025-2026",
  "2026-2027",
  "2027-2028",
  "2028-2029"
];

const DEFAULT_ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin@123"
};

let students = [];

let settings = {
  courses: [...DEFAULT_COURSES],
  years: [...DEFAULT_YEARS]
};

let adminCredentials = { ...DEFAULT_ADMIN_CREDENTIALS };
let selectedStudentId = null;
let editingOriginalStudent = null;

/* HELPER FUNCTIONS */

const $ = id => document.getElementById(id);

function safeRead(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    return fallback;
  }
}

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });

  $(screenId).classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function setMessage(elementId, message, type = "error") {
  const element = $(elementId);
  element.textContent = message;
  element.className = "message";

  if (type === "success") {
    element.classList.add("success");
  }
}

/* UI ADJUSTMENTS */

function addUIAdjustments() {
  if ($("portalUIAdjustments")) return;

  const style = document.createElement("style");
  style.id = "portalUIAdjustments";

  style.textContent = `
    /* Slower shine animation */
    button::before,
    .btn::before,
    .primary-btn::before,
    .secondary-btn::before {
      transition: left 1.4s ease;
    }

    /* Back buttons */
    button.back-button,
    button.back-button:hover,
    button.back-button:active {
      background: transparent !important;
      color: var(--muted) !important;
      border-color: transparent !important;
      box-shadow: none !important;
    }

    button.back-button {
      overflow: visible !important;
      transition: transform .25s ease !important;
    }

    button.back-button:hover {
      transform: scale(1.06) !important;
    }

    button.back-button:active {
      transform: scale(.98) !important;
    }

    button.back-button::before {
      display: none !important;
      content: none !important;
    }

    /* Dashboard settings buttons */
    .dashboard-settings-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin: 30px 0 18px;
    }

    .dashboard-settings-tab {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      min-width: 220px;
      padding: 15px 18px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: white;
      color: var(--text);
      font-size: 12px;
      font-weight: 700;
      text-align: left;
      box-shadow: 0 5px 18px rgba(57, 43, 104, .04);
      transition: transform .25s ease, box-shadow .25s ease,
                  border-color .25s ease, background .25s ease;
    }

    .dashboard-settings-tab:hover {
      transform: translateY(-2px);
      background: #faf9ff;
      color: var(--primary);
      border-color: #cfc5fa;
      box-shadow: 0 8px 20px rgba(89, 66, 197, .09);
    }

    .dashboard-settings-tab::before {
      display: none !important;
      content: none !important;
    }

    .dashboard-settings-tab .tab-arrow {
      color: var(--primary);
      font-size: 17px;
      transition: transform .2s ease;
    }

    .dashboard-settings-tab[aria-expanded="true"] .tab-arrow {
      transform: rotate(90deg);
    }

    .dashboard-settings-panel {
      margin-bottom: 22px;
      animation: cardIn .35s ease;
    }

    .dashboard-settings-panel.hidden {
      display: none !important;
    }

    /* Delete student button */
    .delete-student-button {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 7px;
      width: auto;
      padding: 12px 17px;
      margin: 0;
      border: 1px solid #f1cbd2;
      border-radius: 10px;
      background: #fff7f8;
      color: #d64d65;
      font-size: 11px;
      font-weight: 700;
      box-shadow: none;
      transition: background .2s ease, color .2s ease,
                  border-color .2s ease, transform .2s ease;
    }

    .delete-student-button:hover {
      background: #df5870;
      color: white;
      border-color: #df5870;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(223, 88, 112, .18);
    }

    .delete-student-button::before {
      display: none !important;
      content: none !important;
    }

    .delete-student-button:active {
      transform: scale(.97);
    }

    .edit-actions {
      flex-wrap: wrap;
    }

    @media (max-width: 600px) {
      .dashboard-settings-tabs {
        display: grid;
        grid-template-columns: 1fr;
      }

      .dashboard-settings-tab {
        width: 100%;
      }

      .detail-toolbar {
        flex-wrap: wrap;
      }

      .delete-student-button {
        width: auto;
      }
    }
  `;

  document.head.appendChild(style);
}

/* DASHBOARD EXPANDABLE SETTINGS */

function setupDashboardSettingsTabs() {
  const dashboard = $("adminDashboard");
  if (!dashboard || $("dashboardSettingsTabs")) return;

  const sections = dashboard.querySelectorAll(
    ".dashboard-content > .dashboard-section"
  );

  const coursesSection = sections[0];
  const credentialsSection = sections[1];

  if (!coursesSection || !credentialsSection) return;

  const tabs = document.createElement("div");
  tabs.id = "dashboardSettingsTabs";
  tabs.className = "dashboard-settings-tabs";

  const coursesButton = document.createElement("button");
  coursesButton.type = "button";
  coursesButton.className = "dashboard-settings-tab";
  coursesButton.innerHTML =
    '<span>Manage Courses & Academic Years</span><span class="tab-arrow">→</span>';
  coursesButton.setAttribute("aria-expanded", "false");

  const credentialsButton = document.createElement("button");
  credentialsButton.type = "button";
  credentialsButton.className = "dashboard-settings-tab";
  credentialsButton.innerHTML =
    '<span>Admin Login Credentials</span><span class="tab-arrow">→</span>';
  credentialsButton.setAttribute("aria-expanded", "false");

  tabs.append(coursesButton, credentialsButton);

  const panels = [];

  function createPanel(section, button) {
    const panel = document.createElement("div");
    panel.className = "dashboard-settings-panel hidden";

    section.parentNode.insertBefore(panel, section);
    panel.appendChild(section);

    panels.push({ panel, button });

    button.addEventListener("click", () => {
      const shouldOpen = panel.classList.contains("hidden");

      panels.forEach(item => {
        item.panel.classList.add("hidden");
        item.button.setAttribute("aria-expanded", "false");
      });

      if (shouldOpen) {
        panel.classList.remove("hidden");
        button.setAttribute("aria-expanded", "true");
      }
    });
  }

  coursesSection.parentNode.insertBefore(tabs, coursesSection);

  createPanel(coursesSection, coursesButton);
  createPanel(credentialsSection, credentialsButton);
}

/* DELETE STUDENT BUTTON */

function setupDeleteStudentButton() {
  const editButton = $("editStudentButton");

  if (!editButton || $("deleteStudentButton")) return;

  const deleteButton = document.createElement("button");

  deleteButton.id = "deleteStudentButton";
  deleteButton.type = "button";
  deleteButton.className = "delete-student-button";
  deleteButton.textContent = "Delete Student";

  deleteButton.addEventListener("click", deleteSelectedStudent);

  editButton.insertAdjacentElement("afterend", deleteButton);
}

function deleteSelectedStudent() {
  if (!selectedStudentId) {
    alert("Please select a student first.");
    return;
  }

  loadStudents();

  const student = students.find(s => s.id === selectedStudentId);

  if (!student) {
    alert("Student record not found.");
    closeStudentDetails();
    return;
  }

  const confirmed = confirm(
    `Are you sure you want to permanently delete ${student.name}?\n\nEnrollment Number: ${student.enrollmentNumber}\n\nThis action cannot be undone.`
  );

  if (!confirmed) return;

  const previousStudents = [...students];

  students = students.filter(s => s.id !== selectedStudentId);

  if (!saveStudents()) {
    students = previousStudents;
    return;
  }

  selectedStudentId = null;
  editingOriginalStudent = null;

  $("studentDetail").classList.add("hidden");

  $("totalStudents").textContent = students.length;

  renderStudentList();

  alert("Student record deleted successfully.");

  $("studentList").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* LOAD AND SAVE STUDENTS */

function loadStudents() {
  const saved = safeRead(STUDENTS_KEY, []);
  students = Array.isArray(saved) ? saved : [];
}

function saveStudents() {
  try {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    return true;
  } catch (error) {
    alert("Unable to save student records in browser storage.");
    return false;
  }
}

/* LOAD AND SAVE SETTINGS */

function loadSettings() {
  const saved = safeRead(SETTINGS_KEY, null);

  if (saved && Array.isArray(saved.courses) && Array.isArray(saved.years)) {
    settings = {
      courses: saved.courses,
      years: saved.years
    };
  } else {
    settings = {
      courses: [...DEFAULT_COURSES],
      years: [...DEFAULT_YEARS]
    };
    saveSettings();
  }
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    alert("Unable to save form settings.");
    return false;
  }
}

/* ADMIN CREDENTIALS */

function loadAdminCredentials() {
  const saved = safeRead(ADMIN_CREDENTIALS_KEY, null);

  if (
    saved &&
    typeof saved.username === "string" &&
    typeof saved.password === "string"
  ) {
    adminCredentials = saved;
  } else {
    adminCredentials = { ...DEFAULT_ADMIN_CREDENTIALS };
  }
}

function saveAdminCredentials() {
  try {
    localStorage.setItem(
      ADMIN_CREDENTIALS_KEY,
      JSON.stringify(adminCredentials)
    );
    return true;
  } catch (error) {
    alert("Unable to save admin credentials.");
    return false;
  }
}

/* SPLASH SCREEN */

window.addEventListener("load", () => {
  addUIAdjustments();
  setupDashboardSettingsTabs();
  setupDeleteStudentButton();

  loadStudents();
  loadSettings();
  loadAdminCredentials();

  setTimeout(() => {
    $("splash").classList.add("fade-out");

    setTimeout(() => {
      $("splash").style.display = "none";
      showScreen("main");
    }, 600);
  }, 1500);
});

/* ROLE NAVIGATION */

function selectRole(role) {
  if (role === "admin") {
    showScreen("adminLogin");
    $("loginMessage").textContent = "";
    $("adminLoginForm").reset();
  }

  if (role === "student") {
    showScreen("studentScreen");
  }
}

function goBackToRoles() {
  showScreen("main");
}

function goBack() {
  showScreen("main");
}

function backToStudentPortal() {
  showScreen("studentScreen");
}

function returnToStudentPortal() {
  $("registrationForm").reset();
  showScreen("studentScreen");
}

/* STUDENT PORTAL NAVIGATION */

function openRegistration() {
  loadSettings();
  populateRegistrationOptions();

  $("registrationForm").reset();
  $("registrationMessage").textContent = "";

  showScreen("registrationScreen");
}

function openFindPage() {
  $("findStudentForm").reset();
  $("findMessage").textContent = "";
  $("findResult").innerHTML = "";

  showScreen("findScreen");
}

/* POPULATE COURSE AND YEAR OPTIONS */

function fillSelect(selectId, values, placeholder) {
  const select = $(selectId);
  const currentValue = select.value;

  select.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = placeholder;

  select.appendChild(defaultOption);

  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });

  if (values.includes(currentValue)) {
    select.value = currentValue;
  }
}

function populateRegistrationOptions() {
  fillSelect("regCourse", settings.courses, "Select your course");
  fillSelect("regYear", settings.years, "Select academic year");
}

/* ENROLLMENT NUMBER GENERATOR */

/*
   Project-defined format:
   25016 + 7-digit serial number

   Example: 250160203124
   This is based on the example supplied,
   not a verified official university rule.
*/

function generateEnrollmentNumber() {
  let counter = Number(
    localStorage.getItem(COUNTER_KEY) || 203123
  );

  counter++;

  localStorage.setItem(COUNTER_KEY, String(counter));

  const serial = String(counter).padStart(7, "0");

  return "25016" + serial;
}

/* STUDENT REGISTRATION */

$("registrationForm").addEventListener("submit", event => {
  event.preventDefault();

  loadStudents();

  const name = $("regName").value.trim();
  const email = $("regEmail").value.trim().toLowerCase();
  const phone = $("regPhone").value.trim();
  const course = $("regCourse").value;
  const academicYear = $("regYear").value;

  if (!name || !email || !phone || !course || !academicYear) {
    setMessage(
      "registrationMessage",
      "Please complete all the required fields."
    );
    return;
  }

  const digits = phone.replace(/\D/g, "");

  if (digits.length < 10 || digits.length > 15) {
    setMessage(
      "registrationMessage",
      "Please enter a valid phone number."
    );
    return;
  }

  const emailExists = students.some(student =>
    String(student.email || "").trim().toLowerCase() === email
  );

  if (emailExists) {
    setMessage(
      "registrationMessage",
      "A student record with this email already exists."
    );
    return;
  }

  const phoneExists = students.some(student =>
    normalizePhone(student.phone) === digits
  );

  if (phoneExists) {
    setMessage(
      "registrationMessage",
      "A student record with this phone number already exists."
    );
    return;
  }

  const enrollmentNumber = generateEnrollmentNumber();

  const newStudent = {
    id: Date.now().toString(),
    name,
    email,
    phone,
    course,
    academicYear,
    enrollmentNumber,
    dateOfBirth: "",
    gender: "",
    address: ""
  };

  students.push(newStudent);

  if (!saveStudents()) {
    students.pop();
    return;
  }

  $("generatedEnrollment").textContent = enrollmentNumber;
  $("copyMessage").textContent = "";

  showScreen("successScreen");
});

/* COPY GENERATED ENROLLMENT NUMBER */

$("copyEnrollment").addEventListener("click", async () => {
  const number = $("generatedEnrollment").textContent;

  try {
    await navigator.clipboard.writeText(number);

    $("copyMessage").textContent =
      "Enrollment number copied successfully!";

    $("copyMessage").classList.add("success");
  } catch (error) {
    $("copyMessage").textContent =
      "Copy unavailable. Please select and copy the number manually.";
  }
});

/* PRINT ENROLLMENT */

function printEnrollment() {
  window.print();
}

/* FIND MY ENROLLMENT */

$("findStudentForm").addEventListener("submit", event => {
  event.preventDefault();
  findStudentEnrollment();
});

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function findStudentEnrollment() {
  loadStudents();

  const phone = normalizePhone($("findPhoneInput").value);
  const email = $("findEmailInput").value.trim().toLowerCase();

  const message = $("findMessage");
  const result = $("findResult");

  message.textContent = "";
  result.innerHTML = "";

  if (phone.length < 10 || phone.length > 15 || !email) {
    message.textContent =
      "Please enter a valid phone number and email address.";
    return;
  }

  const student = students.find(s =>
    normalizePhone(s.phone) === phone &&
    String(s.email || "").trim().toLowerCase() === email
  );

  if (!student) {
    message.textContent =
      "No matching student record found. Please check your details.";
    return;
  }

  const card = document.createElement("div");
  card.className = "lookup-success";

  const heading = document.createElement("h3");
  heading.textContent = "Enrollment Details";

  function createDetail(label, value) {
    const p = document.createElement("p");
    const strong = document.createElement("strong");
    const span = document.createElement("span");

    strong.textContent = label + ": ";
    span.textContent = value || "Not available";

    p.append(strong, span);
    return p;
  }

  const numberLabel = document.createElement("span");
  numberLabel.className = "lookup-number-label";
  numberLabel.textContent = "ENROLLMENT NUMBER";

  const enrollment = document.createElement("h2");
  enrollment.className = "lookup-enrollment-number";
  enrollment.textContent = student.enrollmentNumber;

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "copy-button";
  copyButton.textContent = "Copy Enrollment Number";

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(
        String(student.enrollmentNumber)
      );
      copyButton.textContent = "Copied Successfully!";
    } catch (error) {
      copyButton.textContent = "Copy unavailable";
    }
  });

  card.append(
    heading,
    createDetail("Student Name", student.name),
    createDetail("Course", student.course),
    createDetail("Academic Year", student.academicYear),
    numberLabel,
    enrollment,
    copyButton
  );

  result.appendChild(card);
}

/* ADMIN LOGIN */

$("adminLoginForm").addEventListener("submit", event => {
  event.preventDefault();

  loadAdminCredentials();

  const username = $("username").value.trim();
  const password = $("password").value;

  if (
    username === adminCredentials.username &&
    password === adminCredentials.password
  ) {
    setMessage("loginMessage", "Login successful!", "success");

    setTimeout(() => {
      loadStudents();
      loadSettings();

      renderDashboard();
      showScreen("adminDashboard");
    }, 300);
  } else {
    setMessage(
      "loginMessage",
      "Invalid username or password. Please try again."
    );

    const loginCard = document.querySelector(".login-card");

    if (loginCard) {
      loginCard.classList.remove("shake");
      void loginCard.offsetWidth;
      loginCard.classList.add("shake");
    }
  }
});

/* SHOW / HIDE ADMIN PASSWORD */

$("passwordToggle").addEventListener("click", () => {
  const passwordInput = $("password");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    $("passwordToggle").textContent = "Hide";
  } else {
    passwordInput.type = "password";
    $("passwordToggle").textContent = "Show";
  }
});

/* ADMIN LOGOUT */

function logoutAdmin() {
  $("adminLoginForm").reset();
  $("loginMessage").textContent = "";

  showScreen("main");
}

/* ADMIN CREDENTIAL MANAGEMENT */

$("credentialsForm").addEventListener("submit", event => {
  event.preventDefault();

  loadAdminCredentials();

  const currentPassword = $("currentAdminPassword").value;
  const newUsername = $("newAdminUsername").value.trim();
  const newPassword = $("newAdminPassword").value;
  const confirmPassword = $("confirmAdminPassword").value;

  if (currentPassword !== adminCredentials.password) {
    setMessage(
      "credentialsMessage",
      "Your current password is incorrect."
    );
    return;
  }

  if (!newUsername) {
    setMessage(
      "credentialsMessage",
      "Please enter a new username."
    );
    return;
  }

  if (newPassword.length < 8) {
    setMessage(
      "credentialsMessage",
      "Your new password must contain at least 8 characters."
    );
    return;
  }

  if (newPassword !== confirmPassword) {
    setMessage(
      "credentialsMessage",
      "The new passwords do not match."
    );
    return;
  }

  const oldCredentials = { ...adminCredentials };

  adminCredentials = {
    username: newUsername,
    password: newPassword
  };

  if (!saveAdminCredentials()) {
    adminCredentials = oldCredentials;
    return;
  }

  $("credentialsForm").reset();

  setMessage(
    "credentialsMessage",
    "Admin login credentials updated successfully!",
    "success"
  );
});

/* ADMIN DASHBOARD */

function renderDashboard() {
  loadStudents();
  loadSettings();

  $("totalStudents").textContent = students.length;

  $("credentialsForm").reset();
  $("credentialsMessage").textContent = "";

  $("studentSearch").value = "";
  $("yearFilter").value = "";
  $("courseFilter").value = "";

  $("filterPanel").classList.add("hidden");
  $("studentDetail").classList.add("hidden");

  document.querySelectorAll(".dashboard-settings-panel").forEach(panel => {
    panel.classList.add("hidden");
  });

  document.querySelectorAll(".dashboard-settings-tab").forEach(button => {
    button.setAttribute("aria-expanded", "false");
  });

  setupDeleteStudentButton();

  updateFilterOptions();
  renderSettings();
  renderStudentList();
}

/* COURSE AND YEAR MANAGEMENT */

function renderSettings() {
  renderCourseList();
  renderYearList();
  populateRegistrationOptions();
}

function renderCourseList() {
  const list = $("courseList");
  list.innerHTML = "";

  settings.courses.forEach((course, index) => {
    const item = document.createElement("div");
    item.className = "manage-item";

    const name = document.createElement("span");
    name.textContent = course;

    const remove = document.createElement("button");
    remove.className = "remove-item";
    remove.type = "button";
    remove.textContent = "Remove";

    remove.addEventListener("click", () => {
      const used = students.some(student =>
        student.course === course
      );

      if (used) {
        alert(
          "This course is assigned to existing students and cannot be removed."
        );
        return;
      }

      if (!confirm("Remove this course?")) return;

      settings.courses.splice(index, 1);

      saveSettings();
      renderSettings();
      updateFilterOptions();
    });

    item.append(name, remove);
    list.appendChild(item);
  });
}

function renderYearList() {
  const list = $("yearList");
  list.innerHTML = "";

  settings.years.forEach((year, index) => {
    const item = document.createElement("div");
    item.className = "manage-item";

    const name = document.createElement("span");
    name.textContent = year;

    const remove = document.createElement("button");
    remove.className = "remove-item";
    remove.type = "button";
    remove.textContent = "Remove";

    remove.addEventListener("click", () => {
      const used = students.some(student =>
        student.academicYear === year
      );

      if (used) {
        alert(
          "This academic year is assigned to existing students and cannot be removed."
        );
        return;
      }

      if (!confirm("Remove this academic year?")) return;

      settings.years.splice(index, 1);

      saveSettings();
      renderSettings();
      updateFilterOptions();
    });

    item.append(name, remove);
    list.appendChild(item);
  });
}

/* ADD COURSE */

$("courseForm").addEventListener("submit", event => {
  event.preventDefault();

  const course = $("newCourse").value.trim();
  if (!course) return;

  const exists = settings.courses.some(item =>
    item.toLowerCase() === course.toLowerCase()
  );

  if (exists) {
    alert("This course already exists.");
    return;
  }

  settings.courses.push(course);

  saveSettings();
  $("courseForm").reset();

  renderSettings();
  updateFilterOptions();
});

/* ADD ACADEMIC YEAR */

$("yearForm").addEventListener("submit", event => {
  event.preventDefault();

  const year = $("newYear").value.trim();
  if (!year) return;

  if (settings.years.includes(year)) {
    alert("This academic year already exists.");
    return;
  }

  settings.years.push(year);

  saveSettings();
  $("yearForm").reset();

  renderSettings();
  updateFilterOptions();
});

/* STUDENT SEARCH AND FILTERS */

$("studentSearch").addEventListener("input", renderStudentList);
$("yearFilter").addEventListener("change", renderStudentList);
$("courseFilter").addEventListener("change", renderStudentList);

$("filterToggle").addEventListener("click", () => {
  $("filterPanel").classList.toggle("hidden");
});

$("clearFilters").addEventListener("click", () => {
  $("yearFilter").value = "";
  $("courseFilter").value = "";
  $("studentSearch").value = "";

  renderStudentList();
});

function updateFilterOptions() {
  fillSelect("yearFilter", settings.years, "All Academic Years");
  fillSelect("courseFilter", settings.courses, "All Courses");
}

/* RENDER STUDENT LIST */

function renderStudentList() {
  loadStudents();

  const list = $("studentList");
  list.innerHTML = "";

  const search = $("studentSearch").value.trim().toLowerCase();
  const year = $("yearFilter").value;
  const course = $("courseFilter").value;

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      String(student.name || "").toLowerCase().includes(search) ||
      String(student.enrollmentNumber || "").toLowerCase().includes(search);

    const matchesYear =
      !year || student.academicYear === year;

    const matchesCourse =
      !course || student.course === course;

    return matchesSearch && matchesYear && matchesCourse;
  });

  $("recordCount").textContent =
    filteredStudents.length + " records";

  $("totalStudents").textContent = students.length;

  $("emptyState").classList.toggle(
    "hidden",
    filteredStudents.length !== 0
  );

  filteredStudents.forEach(student => {
    const row = document.createElement("div");
    row.className = "student-row";

    const left = document.createElement("div");
    left.className = "student-row-left";

    const avatar = document.createElement("div");
    avatar.className = "student-avatar";
    avatar.textContent =
      String(student.name || "S").charAt(0).toUpperCase();

    const details = document.createElement("div");

    const name = document.createElement("strong");
    name.textContent = student.name;

    const enrollment = document.createElement("small");
    enrollment.textContent = student.enrollmentNumber;

    details.append(name, enrollment);
    left.append(avatar, details);

    const arrow = document.createElement("span");
    arrow.className = "row-arrow";
    arrow.textContent = "→";

    row.append(left, arrow);

    row.addEventListener("click", () => {
      openStudentDetails(student.id);
    });

    list.appendChild(row);
  });
}

/* OPEN STUDENT DETAILS */

function openStudentDetails(studentId) {
  loadStudents();

  const student = students.find(s => s.id === studentId);
  if (!student) return;

  selectedStudentId = studentId;
  editingOriginalStudent = { ...student };

  $("detailName").textContent = student.name;
  $("detailAvatar").textContent =
    String(student.name || "S").charAt(0).toUpperCase();

  $("detailEnrollment").textContent = student.enrollmentNumber;

  $("detailFullName").value = student.name || "";
  $("detailEnrollmentInput").value = student.enrollmentNumber || "";
  $("detailPhone").value = student.phone || "";
  $("detailEmail").value = student.email || "";
  $("detailDob").value = student.dateOfBirth || "";
  $("detailGender").value = student.gender || "";
  $("detailAddress").value = student.address || "";

  fillSelect(
    "detailCourse",
    [...new Set([...settings.courses, student.course].filter(Boolean))],
    "Select course"
  );

  fillSelect(
    "detailYear",
    [...new Set([...settings.years, student.academicYear].filter(Boolean))],
    "Select academic year"
  );

  $("detailCourse").value = student.course || "";
  $("detailYear").value = student.academicYear || "";

  /*
    Hide optional detail fields when they are empty.
    This keeps the profile focused on information
    actually provided by the student.
  */

  setOptionalDetailVisibility("detailDob", student.dateOfBirth);
  setOptionalDetailVisibility("detailGender", student.gender);
  setOptionalDetailVisibility("detailAddress", student.address);

  setStudentEditMode(false);
  $("editMessage").textContent = "";

  setupDeleteStudentButton();

  $("studentDetail").classList.remove("hidden");

  $("studentDetail").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* HIDE EMPTY STUDENT DETAIL FIELDS */

function setOptionalDetailVisibility(inputId, value) {
  const input = $(inputId);

  if (!input) return;

  const fieldContainer = input.closest(".field");

  if (!fieldContainer) return;

  fieldContainer.classList.toggle(
    "hidden",
    !String(value || "").trim()
  );
}

/* STUDENT EDIT MODE */

function setStudentEditMode(enabled) {
  const fields = [
    "detailFullName",
    "detailEnrollmentInput",
    "detailPhone",
    "detailEmail",
    "detailDob",
    "detailGender",
    "detailCourse",
    "detailYear",
    "detailAddress"
  ];

  fields.forEach(id => {
    $(id).disabled = !enabled;
  });

  $("editActions").classList.toggle("hidden", !enabled);
  $("editStudentButton").classList.toggle("hidden", enabled);

  const deleteButton = $("deleteStudentButton");

  if (deleteButton) {
    deleteButton.classList.toggle("hidden", enabled);
  }
}

function enableStudentEdit() {
  if (!selectedStudentId) return;

  /*
    Show optional fields while editing so the admin
    can add information if required.
  */

  ["detailDob", "detailGender", "detailAddress"].forEach(id => {
    const input = $(id);
    const container = input ? input.closest(".field") : null;

    if (container) {
      container.classList.remove("hidden");
    }
  });

  setStudentEditMode(true);
}

function cancelStudentEdit() {
  if (!selectedStudentId) return;
  openStudentDetails(selectedStudentId);
}

function saveStudentEdit() {
  loadStudents();

  const student = students.find(s =>
    s.id === selectedStudentId
  );

  if (!student) return;

  const name = $("detailFullName").value.trim();
  const enrollment = $("detailEnrollmentInput").value.trim();
  const phone = $("detailPhone").value.trim();
  const email = $("detailEmail").value.trim().toLowerCase();
  const course = $("detailCourse").value;
  const academicYear = $("detailYear").value;

  if (!name || !enrollment || !phone || !email || !course || !academicYear) {
    setMessage(
      "editMessage",
      "Please complete all required fields."
    );
    return;
  }

  const digits = normalizePhone(phone);

  if (digits.length < 10 || digits.length > 15) {
    setMessage("editMessage", "Please enter a valid phone number.");
    return;
  }

  const duplicateEnrollment = students.some(s =>
    s.id !== selectedStudentId &&
    s.enrollmentNumber === enrollment
  );

  if (duplicateEnrollment) {
    setMessage(
      "editMessage",
      "This enrollment number is already assigned to another student."
    );
    return;
  }

  const duplicateEmail = students.some(s =>
    s.id !== selectedStudentId &&
    String(s.email || "").trim().toLowerCase() === email
  );

  if (duplicateEmail) {
    setMessage(
      "editMessage",
      "This email is already assigned to another student."
    );
    return;
  }

  const duplicatePhone = students.some(s =>
    s.id !== selectedStudentId &&
    normalizePhone(s.phone) === digits
  );

  if (duplicatePhone) {
    setMessage(
      "editMessage",
      "This phone number is already assigned to another student."
    );
    return;
  }

  const previousStudent = { ...student };

  student.name = name;
  student.enrollmentNumber = enrollment;
  student.phone = phone;
  student.email = email;
  student.course = course;
  student.academicYear = academicYear;

  student.dateOfBirth = $("detailDob").value;
  student.gender = $("detailGender").value;
  student.address = $("detailAddress").value.trim();

  if (!saveStudents()) {
    Object.assign(student, previousStudent);
    return;
  }

  $("detailName").textContent = student.name;
  $("detailEnrollment").textContent = student.enrollmentNumber;

  $("detailAvatar").textContent =
    student.name.charAt(0).toUpperCase();

  setStudentEditMode(false);

  /* Hide optional fields again if they remain empty */
  setOptionalDetailVisibility("detailDob", student.dateOfBirth);
  setOptionalDetailVisibility("detailGender", student.gender);
  setOptionalDetailVisibility("detailAddress", student.address);

  setMessage(
    "editMessage",
    "Student details updated successfully.",
    "success"
  );

  renderStudentList();
  $("totalStudents").textContent = students.length;
}

/* CLOSE STUDENT DETAILS */

function closeStudentDetails() {
  $("studentDetail").classList.add("hidden");

  selectedStudentId = null;
  editingOriginalStudent = null;

  renderStudentList();

  $("studentList").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}
