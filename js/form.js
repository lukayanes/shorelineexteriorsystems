/* Shoreline Exterior Systems — branded quote form.
 *
 * Posts to a GoHighLevel Inbound Webhook (set as data-endpoint on the form).
 * Design rule: a lead must never be lost silently. If the endpoint is missing
 * or the request fails, the form says so and shows the phone number and a
 * mailto: link with the answers already filled in.
 */
(function () {
  'use strict';

  var PHONE_DISPLAY = '(941) 265-1028';
  var PHONE_TEL = '19412651028';
  var EMAIL = 'shorelineexteriorsystems@gmail.com';

  function fallbackHTML(data, reason) {
    var body = [
      'Name: ' + (data.full_name || ''),
      'Phone: ' + (data.phone || ''),
      'Email: ' + (data.email || ''),
      'Service: ' + (data.service || ''),
      '',
      data.message || ''
    ].join('\n');
    var mailto = 'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent('Quote request — ' + (data.full_name || 'website')) +
      '&body=' + encodeURIComponent(body);
    return reason + ' Please call <a href="tel:' + PHONE_TEL + '">' + PHONE_DISPLAY +
      '</a> or <a href="' + mailto + '">send this as an email</a> — we don\'t want to lose your request.';
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  function validPhone(v) {
    return (v.replace(/\D/g, '').length >= 10);
  }

  document.querySelectorAll('.quote-form').forEach(function (form) {
    var endpoint = form.getAttribute('data-endpoint') || '';
    var msgKey = form.getAttribute('data-msgkey') || '';
    var okNote = form.querySelector('.form-note.ok');
    var badNote = form.querySelector('.form-note.bad');
    var submit = form.querySelector('button[type="submit"]');
    var loadedAt = Date.now();

    function note(el, html) {
      okNote.dataset.show = 'false';
      badNote.dataset.show = 'false';
      el.innerHTML = html;
      el.dataset.show = 'true';
    }

    function markField(input, bad) {
      var field = input.closest('.field') || input.closest('.consent');
      if (!field) return;
      field.classList.toggle('is-bad', bad);
      input.setAttribute('aria-invalid', bad ? 'true' : 'false');
    }

    function validate() {
      var problems = [];
      var checks = [
        ['full_name', function (v) { return v.trim().length > 1; }],
        ['phone', validPhone],
        ['email', validEmail],
        ['message', function (v) { return v.trim().length > 2; }]
      ];
      checks.forEach(function (pair) {
        var input = form.elements[pair[0]];
        if (!input) return;
        var ok = pair[1](input.value);
        markField(input, !ok);
        if (!ok) problems.push(input);
      });
      var consent = form.elements.consent;
      if (consent) {
        var cwrap = consent.closest('.consent');
        if (cwrap) cwrap.classList.toggle('is-bad', !consent.checked);
        if (!consent.checked) problems.push(consent);
      }
      return problems;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var problems = validate();
      if (problems.length) {
        note(badNote, 'Please check the highlighted fields.');
        problems[0].focus();
        return;
      }

      // spam traps: honeypot filled, or submitted implausibly fast
      var trapped = (form.elements.website && form.elements.website.value !== '') ||
                    (Date.now() - loadedAt < 2500);

      var data = {
        full_name: form.elements.full_name.value.trim(),
        phone: form.elements.phone.value.trim(),
        email: form.elements.email.value.trim(),
        service: form.elements.service ? form.elements.service.value : '',
        message: form.elements.message.value.trim(),
        consent: true,
        page: window.location.pathname,
        source: 'shorelineexteriorsystems.com'
      };
      if (msgKey) data[msgKey] = data.message;

      if (trapped) {
        // say nothing useful to a bot, but never block a real person outright
        note(okNote, 'Thanks — your request has been received.');
        form.reset();
        return;
      }

      if (!endpoint) {
        note(badNote, fallbackHTML(data, 'This form isn\'t connected yet.'));
        return;
      }

      submit.disabled = true;
      var original = submit.textContent;
      submit.textContent = 'Sending…';

      var done = function (ok, reason) {
        submit.disabled = false;
        submit.textContent = original;
        if (ok) {
          note(okNote, '<strong>Thanks — we\'ve got it.</strong><br>We\'ll be in touch within one business day. If it\'s urgent, call <a href="tel:' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a>.');
          form.reset();
          loadedAt = Date.now();
        } else {
          note(badNote, fallbackHTML(data, reason));
        }
      };

      // GHL inbound webhooks do not return CORS headers, so a normal fetch
      // read would fail even on success. Send it and treat a completed
      // request as delivered; a network-level failure still reaches the user.
      fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function () {
        done(true);
      }).catch(function () {
        done(false, 'We couldn\'t send that just now.');
      });
    });

    // clear the error state as soon as someone starts fixing a field
    form.addEventListener('input', function (e) {
      if (e.target.matches('input, select, textarea')) markField(e.target, false);
      if (e.target.name === 'consent') {
        var w = e.target.closest('.consent');
        if (w) w.classList.remove('is-bad');
      }
    });
  });
})();
