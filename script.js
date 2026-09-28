const FORMSPREE_ENDPOINT = "https://formspree.io/f/mrpbodwv";

const introScreen = document.getElementById("introScreen");
const planScreen = document.getElementById("planScreen");
const resultScreen = document.getElementById("resultScreen");

const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");

const dateForm = document.getElementById("dateForm");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const placeInput = document.getElementById("place");
const noteInput = document.getElementById("note");
const submitButton = document.getElementById("submitButton");

const resultDate = document.getElementById("resultDate");
const resultTime = document.getElementById("resultTime");
const resultPlace = document.getElementById("resultPlace");
const resultNote = document.getElementById("resultNote");
const resultNoteRow = document.getElementById("resultNoteRow");

const restartButton = document.getElementById("restartButton");
const toast = document.getElementById("toast");

const today = new Date();
const localToday = new Date(
  today.getTime() - today.getTimezoneOffset() * 60000
)
  .toISOString()
  .split("T")[0];

dateInput.min = localToday;

// Кнопка "Нет" убегает в случайное место.
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

noButton.addEventListener(
  "touchstart",
  (event) => {
    event.preventDefault();
    moveNoButton();
  },
  { passive: false }
);

yesButton.addEventListener("click", () => {
  noButton.classList.remove("is-floating");
  noButton.removeAttribute("style");

  introScreen.classList.add("hidden");
  planScreen.classList.remove("hidden");

  dateInput.focus();
});

// Отправка нашего собственного HTML-поля в Formspree.
dateForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!dateForm.reportValidity()) {
    return;
  }

  const selectedDate = new Date(`${dateInput.value}T00:00:00`);
  const minimumDate = new Date(`${localToday}T00:00:00`);

  if (selectedDate < minimumDate) {
    showToast("Выбери дату сегодня или позже.");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Сохраняю наш план… 💗";

  const formData = new FormData(dateForm);

  // Тема письма в почте.
  formData.append("_subject", "💗 Новое свидание с сайта");

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      let errorMessage = "Не удалось отправить ответ.";
      try {
        const data = await response.json();
        if (data?.errors?.length) {
          errorMessage = data.errors.map((item) => item.message).join(" ");
        }
      } catch {
        // Оставляем стандартное сообщение.
      }
      throw new Error(errorMessage);
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
  } catch (error) {
    console.error("Formspree error:", error);
    showToast(
      error.message ||
      "Не удалось отправить ответ. Проверь интернет и попробуй ещё раз."
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Сохранить наше свидание ✨";
  }
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
  }, 3200);
}

window.addEventListener("resize", () => {
  if (!noButton.classList.contains("is-floating")) {
    return;
  }

  const rect = noButton.getBoundingClientRect();
  const padding = 16;

  const maxX = window.innerWidth - rect.width - padding;
  const maxY = window.innerHeight - rect.height - padding;

  noButton.style.left = `${Math.max(padding, Math.min(rect.left, maxX))}px`;
  noButton.style.top = `${Math.max(padding, Math.min(rect.top, maxY))}px`;
});
