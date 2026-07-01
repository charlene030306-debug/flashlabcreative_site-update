/* connect.js — Contact page scripts */

/* HERO IMAGE PLACEHOLDER */
(function () {
  const imgEl = document.querySelector('.hero-image-frame img');
  const defaultPh = document.getElementById('hero-placeholder-default');
  if (imgEl) {
    imgEl.addEventListener('load', () => { if (defaultPh) defaultPh.style.display = 'none'; });
    imgEl.addEventListener('error', () => { imgEl.style.display = 'none'; if (defaultPh) defaultPh.style.display = 'flex'; });
  }
})();

/* EMAILJS INIT */
emailjs.init('9AcMTpYMO7ViRTRMK');

/* CONTACT FORM HANDLER */
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name    = document.getElementById('field-name').value.trim();
  const mobile  = document.getElementById('field-mobile').value.trim();
  const email   = document.getElementById('field-email').value.trim();
  const enquiry = document.getElementById('field-enquiry').value;
  const message = document.getElementById('field-message').value.trim();
  const noteEl  = document.getElementById('formNote');
  const btn     = document.getElementById('formBtn');

  if (!name || !mobile || !email || !enquiry) {
    noteEl.textContent = 'Please fill in all required fields.';
    noteEl.className   = 'form-note error';
    return;
  }

  btn.disabled    = true;
  btn.innerHTML   = '<i class="ri-loader-4-line"></i> Sending…';
  noteEl.textContent = '';
  noteEl.className   = 'form-note';

  emailjs.send('service_ugavxkq', 'template_4dptoed', {
    name:    name,
    email:   email,
    mobile:  mobile,
    enquiry: enquiry,
    message: message
  })
  .then(function () {
    const form = document.getElementById('contactForm');
    const ty   = document.getElementById('formThankyou');
    document.getElementById('ty-name').textContent = name;
    form.style.display = 'none';
    ty.classList.add('active');

    setTimeout(function () {
      ty.classList.add('leaving');
      setTimeout(function () {
        ty.classList.remove('active', 'leaving');
        form.reset();
        form.style.display = '';
        btn.disabled  = false;
        btn.innerHTML = '<i class="ri-mail-send-line"></i> Send Message';
      }, 500);
    }, 3500);
  })
  .catch(function (err) {
    btn.disabled  = false;
    btn.innerHTML = '<i class="ri-mail-send-line"></i> Send Message';
    noteEl.textContent = 'Something went wrong. Please try again.';
    noteEl.className   = 'form-note error';
    console.error('EmailJS error:', err);
  });
});
