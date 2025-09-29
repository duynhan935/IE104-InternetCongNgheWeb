// Booking Form Handler
document.addEventListener("DOMContentLoaded", function () {
  // Lấy phần tử đầu tiên có class "booking-form"
  const form = document.querySelector(".booking-form");
  const dateInput = form.querySelector("input[name='date']");
  const timeInput = form.querySelector("input[name='time']");

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);

  // Form validation and submission
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Clear all old errors
    clearErrors();

    const formData = {
      name: form.querySelector("input[name='name']").value,
      phone: form.querySelector("input[name='phone']").value,
      email: form.querySelector("input[name='email']").value,
      person: form.querySelector("select[name='person']").value,
      date: dateInput.value,
      time: timeInput.value,
    };

    // Validate all fields
    if (!validateForm(formData)) {
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector("button[type='submit']");
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = "Booking...";
    submitBtn.disabled = true;

    // Simulate booking submission
    setTimeout(function () {
      alert("Booking successful!");
      form.reset();
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    }, 2000);
  });

  // Form validation
  function validateForm(data) {
    let isValid = true;

    if (data.name.trim().length < 2) {
      showError(
        form.querySelector("input[name='name']"),
        "Name must be at least 2 characters"
      );
      isValid = false;
    }

    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(data.phone)) {
      showError(
        form.querySelector("input[name='phone']"),
        "Please enter a valid phone number"
      );
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      showError(
        form.querySelector("input[name='email']"),
        "Please enter a valid email address"
      );
      isValid = false;
    }

    if (!data.person) {
      showError(
        form.querySelector("select[name='person']"),
        "Please select number of persons"
      );
      isValid = false;
    }

    if (!data.date) {
      showError(dateInput, "Please select a valid date");
      isValid = false;
    }

    if (!data.time) {
      showError(timeInput, "Please select a valid time");
      isValid = false;
    }

    return isValid;
  }

  // Show error message
  function showError(input, message) {
    input.style.borderColor = "#ef4444";
    let error = input.parentElement.querySelector(".error-message");
    if (error) {
      error.textContent = message;
      error.style.color = "red";
    }
  }

  // Clear all error messages
  function clearErrors() {
    const errors = form.querySelectorAll(".error-message");
    errors.forEach((err) => (err.textContent = ""));
    const inputs = form.querySelectorAll("input, select");
    inputs.forEach((input) => (input.style.borderColor = ""));
  }

  // Input formatting for phone number
  const phoneInput = form.querySelector('input[type="tel"]');
  phoneInput.addEventListener("input", function (e) {
    let value = e.target.value.replace(/[^\d+\-\s()]/g, "");
    e.target.value = value;
  });
});
