const introScreen = document.getElementById("introScreen");
const planScreen = document.getElementById("planScreen");
const resultScreen = document.getElementById("resultScreen");

const buttonArea = document.getElementById("buttonArea");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");

const dateForm = document.getElementById("dateForm");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const placeInput = document.getElementById("place");
const noteInput = document.getElementById("note");

const resultDate = document.getElementById("resultDate");
const resultTime = document.getElementById("resultTime");
const resultPlace = document.getElementById("resultPlace");
const resultNote = document.getElementById("resultNote");
const resultNoteRow = document.getElementById("resultNoteRow");

const restartButton = document.getElementById("restartButton");
const toast = document.getElementById("toast");

// Не разрешаем выбрать дату в прошлом.
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];
dateInput.min = localToday;

// "Нет" убегает в случайное место окна.
function moveNoButton() {
  const padding = 16;
  const buttonWidth = noButton.offsetWidth || 120;
  const buttonHeight = noButton.offsetHeight || 52;

  const maxX = Math.max(padding, window.innerWidth - buttonWidth - padding);
  const maxY = Math.max(padding, window.innerHeight - buttonHeight - padding);

  const x = Math.floor(Math.random() * (maxX - padding + 1)) + padding;
  const y = Math.floor(Math.random() * (maxY - padding + 1)) + padding;

  noButton.classList.add("is-floating");
  noButton.style.left = `${x}px`;
  noButton.style.top = `${y}px`;
}

noButton.addEventListener("mouseenter", moveNoButton);
noButton.addEventListener("focus", moveNoButton);
noButton.addEventListener("click", moveNoButton);

// На телефонах курсора нет, поэтому делаем убегание и на touch.
noButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  moveNoButton();
}, { passive: false });

yesButton.addEventListener("click", () => {
  noButton.classList.remove("is-floating");
  noButton.removeAttribute("style");

  introScreen.classList.add("hidden");
  planScreen.classList.remove("hidden");

  dateInput.focus();
});

dateForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedDate = new Date(`${dateInput.value}T00:00:00`);

  if (!dateInput.value || !timeInput.value ) {
    showToast("Заполни дату, время 💗");
    return;
  }

  if (selectedDate < new Date(`${localToday}T00:00:00`)) {
    showToast("Выбери дату сегодня или позже.");
    return;
  }

  const formattedDate = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(selectedDate);

  resultDate.textContent = formattedDate;
  resultTime.textContent = timeInput.value;
  resultPlace.textContent = placeInput.value.trim();

  const note = noteInput.value.trim();
  if (note) {
    resultNote.textContent = note;
    resultNoteRow.classList.remove("hidden");
  } else {
    resultNoteRow.classList.add("hidden");
  }

  planScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
});

restartButton.addEventListener("click", () => {
  resultScreen.classList.add("hidden");
  planScreen.classList.remove("hidden");
});

let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

window.addEventListener("resize", () => {
  // Если кнопка "Нет" уже убежала, не оставляем её за границами экрана.
  if (noButton.classList.contains("is-floating")) {
    const rect = noButton.getBoundingClientRect();
    const padding = 16;

    const maxX = window.innerWidth - rect.width - padding;
    const maxY = window.innerHeight - rect.height - padding;

    noButton.style.left = `${Math.max(padding, Math.min(rect.left, maxX))}px`;
    noButton.style.top = `${Math.max(padding, Math.min(rect.top, maxY))}px`;
  }
});
