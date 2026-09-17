const API_URL = "https://dummyjson.com/users";

let employees = [];
let currentDept = "All";
let currentSearch = "";
let nextLocalId = 9000;

const DEPARTMENTS = ["IT", "HR", "Finance", "Marketing"];

const cardGrid       = document.querySelector("#cardGrid");
const loadingMessage = document.querySelector("#loadingMessage");
const employeeCount  = document.querySelector("#employeeCount");

const searchInput = document.querySelector("#searchInput");
const searchBtn   = document.querySelector("#searchBtn");
const deptButtons = document.querySelectorAll(".dept-btn");
const sortSelect  = document.querySelector("#sortSelect");

const addEmployeeForm = document.querySelector("#addEmployeeForm");
const empNameInput    = document.querySelector("#empName");
const empAgeInput     = document.querySelector("#empAge");
const empEmailInput   = document.querySelector("#empEmail");
const empPhoneInput   = document.querySelector("#empPhone");
const empDeptInput    = document.querySelector("#empDept");
const empSalaryInput  = document.querySelector("#empSalary");
const formError       = document.querySelector("#formError");

const totalSalaryText     = document.querySelector("#totalSalary");
const avgSalaryText       = document.querySelector("#avgSalary");
const highestSalaryValue  = document.querySelector("#highestSalaryValue");
const highestPaidInfo     = document.querySelector("#highestPaidInfo");

const todayDateText   = document.querySelector("#todayDate");
const currentTimeText = document.querySelector("#currentTime");

function showDateTime() {
  const now = new Date();

  const months = ["January", "February", "March", "April", "May", "June",
                   "July", "August", "September", "October", "November", "December"];

  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;
  const minuteStr = minutes < 10 ? `0${minutes}` : minutes;
  const secondStr = seconds < 10 ? `0${seconds}` : seconds;

  todayDateText.textContent = `Today: ${dateStr}`;
  currentTimeText.textContent = `Time: ${hours}:${minuteStr}:${secondStr} ${ampm}`;
}

showDateTime();
setInterval(showDateTime, 1000);

function generateAvatar(name) {
  const initials = name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect width="100" height="100" fill="#C9A24B" />
      <text x="50" y="62" font-size="40" text-anchor="middle" fill="#10181A" font-family="Arial, sans-serif">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function fetchEmployees() {
  loadingMessage.textContent = "Loading employees...";
  loadingMessage.className = "";

  fetch(API_URL)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const { users } = data;

      const apiEmployees = users.map((user, index) => {
        const { id, firstName, lastName, age, email, phone, image, company } = user;

        const randomSalary = Math.floor(Math.random() * (95000 - 30000 + 1)) + 30000;

        return {
          id: id,
          name: `${firstName} ${lastName}`,
          age: age,
          email: email,
          phone: phone,
          department: DEPARTMENTS[index % DEPARTMENTS.length],
          company: company ? company.name : "N/A",
          image: image,
          salary: randomSalary
        };
      });

      employees = [...apiEmployees];

      loadingMessage.textContent = "Employee data loaded successfully.";
      loadingMessage.className = "success";

      setTimeout(() => {
        loadingMessage.textContent = "";
        loadingMessage.className = "";
      }, 2500);

      refreshUI();
    })
    .catch((error) => {
      loadingMessage.textContent = "Unable to load employee data. Please try again.";
      loadingMessage.className = "error";
      console.error(error.message);
    })
    .finally(() => {
      console.log("fetchEmployees() finished running.");
    });
}

function displayEmployees(list) {
  cardGrid.innerHTML = "";

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "no-results";
    empty.textContent = "No employees match this search / filter.";
    cardGrid.append(empty);
    return;
  }

  list.forEach((emp) => {
    const card = document.createElement("div");
    card.className = "employee-card";
    card.setAttribute("data-id", emp.id);

    const imageUrl = emp.image ? emp.image : generateAvatar(emp.name);

    card.innerHTML = `
      <img src="${imageUrl}" alt="${emp.name}">
      <h3>${emp.name}</h3>
      <p>Age: ${emp.age}</p>
      <p>Email: ${emp.email}</p>
      <p>Phone: ${emp.phone}</p>
      <p>Salary: ₹${emp.salary.toLocaleString("en-IN")}</p>
      <span class="dept-tag">${emp.department}</span>
      <button class="delete-btn">Delete</button>
    `;

    const deleteBtn = card.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => {
      deleteEmployee(emp.id);
    });

    cardGrid.append(card);
  });
}

function searchEmployees() {
  currentSearch = searchInput.value;
  refreshUI();
}

searchBtn.addEventListener("click", searchEmployees);

searchInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    searchEmployees();
  }
});

function filterDepartment(dept) {
  currentDept = dept;

  deptButtons.forEach((btn) => {
    if (btn.getAttribute("data-dept") === dept) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  refreshUI();
}

deptButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const dept = btn.getAttribute("data-dept");
    filterDepartment(dept);
  });
});

function getFilteredEmployees() {
  let result = employees;

  if (currentDept !== "All") {
    result = result.filter((emp) => emp.department === currentDept);
  }

  if (currentSearch.trim() !== "") {
    result = result.filter((emp) =>
      emp.name.toLowerCase().includes(currentSearch.toLowerCase())
    );
  }

  return result;
}

function findEmployeeById(id) {
  return employees.find((emp) => emp.id === id);
}

function updateEmployeeCount(list) {
  employeeCount.textContent = list.length;
}

function setFieldValidity(inputEl, isValid) {
  inputEl.style.borderColor = isValid ? "var(--border)" : "var(--danger)";
  inputEl.style.borderWidth = isValid ? "1px" : "2px";
}

function validateEmployee(name, age, email, department) {
  const requiredFields = [name, String(age), email, department];
  const allFieldsFilled = requiredFields.every((field) => field.trim() !== "");

  if (!allFieldsFilled) {
    return "❌ Please fill in every field before submitting";
  }

  if (name === "") {
    return "❌ Please enter employee name";
  } else if (isNaN(age) || age === "" || age <= 18) {
    return "❌ Age must be greater than 18";
  } else if (email === "") {
    return "❌ Please enter employee email";
  } else if (department === "") {
    return "❌ Please select a department";
  }

  const emailAlreadyUsed = employees.some(
    (emp) => emp.email.toLowerCase() === email.toLowerCase()
  );

  if (emailAlreadyUsed) {
    return "❌ An employee with this email already exists";
  }

  return "";
}

function addEmployee(event) {
  event.preventDefault();

  const name = empNameInput.value.trim();
  const age = Number(empAgeInput.value);
  const email = empEmailInput.value.trim();
  const phone = empPhoneInput.value.trim();
  const department = empDeptInput.value;
  const salaryInput = Number(empSalaryInput.value);

  const errorMessage = validateEmployee(name, age, email, department);

  setFieldValidity(empNameInput, name !== "");
  setFieldValidity(empAgeInput, !isNaN(age) && age > 18);
  setFieldValidity(empEmailInput, email !== "");
  setFieldValidity(empDeptInput, department !== "");

  if (errorMessage !== "") {
    formError.textContent = errorMessage;
    return;
  }

  formError.textContent = "";

  const salary = salaryInput > 0 ? salaryInput : 0;

  const newEmployee = {
    id: nextLocalId++,
    name: name,
    age: age,
    email: email,
    phone: phone !== "" ? phone : "N/A",
    department: department,
    company: "Local Hire",
    image: generateAvatar(name),
    salary: salary
  };

  employees.push(newEmployee);

  clearForm();
  refreshUI();
}

addEmployeeForm.addEventListener("submit", addEmployee);

function clearForm() {
  empNameInput.value = "";
  empAgeInput.value = "";
  empEmailInput.value = "";
  empPhoneInput.value = "";
  empDeptInput.value = "";
  empSalaryInput.value = "";

  [empNameInput, empAgeInput, empEmailInput, empDeptInput].forEach((input) => {
    setFieldValidity(input, true);
  });
}

function deleteEmployee(id) {
  const employeeToDelete = findEmployeeById(id);

  if (employeeToDelete) {
    console.log(`Removing ${employeeToDelete.name} from the dashboard.`);
  }

  employees = employees.filter((emp) => emp.id !== id);
  refreshUI();
}

function calculateSalary(list) {
  const totalSalary = list.reduce((acc, emp) => acc + emp.salary, 0);
  const averageSalary = list.length > 0 ? Math.round(totalSalary / list.length) : 0;

  totalSalaryText.textContent = `₹${totalSalary.toLocaleString("en-IN")}`;
  avgSalaryText.textContent = `₹${averageSalary.toLocaleString("en-IN")}`;
}

function highestPaidEmployee(list) {
  if (list.length === 0) {
    highestSalaryValue.textContent = "₹0";
    highestPaidInfo.innerHTML = "No employees to show yet.";
    return;
  }

  const topEmployee = list.reduce((highest, current) => {
    return current.salary > highest.salary ? current : highest;
  });

  highestSalaryValue.textContent = `₹${topEmployee.salary.toLocaleString("en-IN")}`;
  highestPaidInfo.innerHTML = `
    <strong>Name:</strong> ${topEmployee.name}<br>
    <strong>Department:</strong> ${topEmployee.department}<br>
    <strong>Salary:</strong> ₹${topEmployee.salary.toLocaleString("en-IN")}
  `;
}

function countEmployeesByDepartment(list) {
  let counts = { IT: 0, HR: 0, Finance: 0, Marketing: 0 };

  for (let i = 0; i < list.length; i++) {
    const dept = list[i].department;
    counts[dept] = counts[dept] + 1;
  }

  console.log("Department breakdown:", counts);
  return counts;
}

function sortEmployees(field, direction) {
  employees.sort((a, b) => {
    let valA = a[field];
    let valB = b[field];

    if (typeof valA === "string") {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
      return direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    return direction === "asc" ? valA - valB : valB - valA;
  });

  refreshUI();
}

sortSelect.addEventListener("change", () => {
  const choice = sortSelect.value;

  if (choice === "default") {
    return;
  }

  const [field, direction] = choice.split("-");
  sortEmployees(field, direction);
});

function refreshUI() {
  const filtered = getFilteredEmployees();
  displayEmployees(filtered);
  updateEmployeeCount(filtered);
  calculateSalary(filtered);
  highestPaidEmployee(filtered);
  countEmployeesByDepartment(employees);
}

fetchEmployees();