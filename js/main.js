document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const overlay = document.querySelector('.nav-overlay');
  const body = document.body;

  // ------- Navbar scroll state -------
  const handleScrollNavbar = () => {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScrollNavbar);
  handleScrollNavbar();

  // ------- Mobile menu toggle -------
  const toggleNav = () => {
    const isOpen = body.classList.toggle('nav-open');
    navLinks.classList.toggle('open', isOpen);
    overlay.classList.toggle('show', isOpen);
  };

  if (navToggle) {
    navToggle.addEventListener('click', toggleNav);
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      body.classList.remove('nav-open');
      navLinks.classList.remove('open');
      overlay.classList.remove('show');
    });
  }

  // Tutup menu setelah klik link
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      body.classList.remove('nav-open');
      navLinks.classList.remove('open');
      overlay.classList.remove('show');
    });
  });

  // ------- Smooth scroll dengan offset navbar -------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      e.preventDefault();
      const navbarHeight = navbar.offsetHeight;
      const elementTop = targetEl.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementTop - navbarHeight - 8;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    });
  });

  // ------- Scroll reveal (animasi muncul) -------
  const animatedEls = document.querySelectorAll('[data-animate]');
  if ('IntersectionObserver' in window && animatedEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    animatedEls.forEach((el) => observer.observe(el));
  } else {
    animatedEls.forEach((el) => el.classList.add('visible'));
  }

  // ------- Highlight nav link aktif berdasarkan section -------
  const sections = document.querySelectorAll('[data-section]');
  const navItems = document.querySelectorAll('.nav-links a[data-nav]');

  if ('IntersectionObserver' in window && sections.length && navItems.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section');
            navItems.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('data-nav') === id);
            });
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    sections.forEach((sec) => sectionObserver.observe(sec));
  }

  // ------- Handle form booking (fake send) -------
  const bookingForm = document.getElementById('booking-form');
  const bookingBtn = document.getElementById('booking-btn');
  const formMessage = document.getElementById('form-message');
  const bookingLog = document.getElementById('booking-log');
  const bookingLogList = bookingLog?.querySelector('.booking-log-list');
  const bookingLogEmpty = bookingLog?.querySelector('.booking-log-empty');

  if (bookingForm && bookingBtn && formMessage && bookingLogList) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault(); // jangan reload halaman

      const nama = document.getElementById('nama').value.trim();
      const wa = document.getElementById('wa').value.trim();
      const jadwal = document.getElementById('jadwal').value.trim();
      const catatan = document.getElementById('catatan').value.trim();

      // ===== Enhanced booking form: validation, auto WA, messages, localStorage save =====
      const bookingForm = document.getElementById('booking-form');
      const bookingBtn = document.getElementById('booking-btn');
      const formMessage = document.getElementById('form-message');
      const bookingLogList = document.querySelector('.booking-log-list');
      const bookingLogEmpty = document.querySelector('.booking-log-empty');

      const WA_NUMBER = '62895635383351'; // <-- GANTI NOMOR LO (tanpa +)
      const WA_LINK_BASE = `https://wa.me/${WA_NUMBER}`;

      if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
          e.preventDefault();

          // ambil nilai
          const nama = document.getElementById('nama').value.trim();
          const wa = document.getElementById('wa').value.trim();
          const jadwal = document.getElementById('jadwal').value.trim();
          const catatan = document.getElementById('catatan').value.trim();

          // reset pesan
          formMessage.textContent = '';
          formMessage.classList.remove('error', 'success');

          // validasi sederhana
          if (!nama || !wa || !jadwal) {
            formMessage.textContent = 'Nama, WhatsApp, dan Jam/Paket wajib diisi.';
            formMessage.classList.add('error');
            return;
          }

          // disable tombol & animasi kirim
          bookingBtn.disabled = true;
          const originalHtml = bookingBtn.innerHTML;
          bookingBtn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Mengirim...`;

          setTimeout(() => {
            bookingBtn.disabled = false;
            bookingBtn.innerHTML = originalHtml;

            // pesan sukses
            formMessage.textContent = 'Permintaan booking terkirim. Kamu akan diarahkan ke WhatsApp.';
            formMessage.classList.add('success');

            // masukin ke log
            if (bookingLogEmpty) bookingLogEmpty.style.display = 'none';
            const li = document.createElement('li');
            const timeStr = new Date().toLocaleString();
            li.innerHTML = `<strong>${nama}</strong> (${wa}) — ${jadwal}<br/><small>${catatan ? catatan + ' — ' : ''}${timeStr}</small>`;
            if (bookingLogList) bookingLogList.prepend(li);

            // reset form
            bookingForm.reset();

            // simpan ke localStorage (opsional)
            try {
              const prev = JSON.parse(localStorage.getItem('bookingLog') || '[]');
              prev.unshift({ nama, wa, jadwal, catatan, time: timeStr });
              localStorage.setItem('bookingLog', JSON.stringify(prev.slice(0, 40)));
            } catch (err) {
              /* ignore */
            }

            // BAWA USER KE WHATSAPP DENGAN PESAN TERISi
            const text = encodeURIComponent(`Halo Febri & Rizky, saya ${nama}. Saya mau booking: ${jadwal}. WA: ${wa}. Catatan: ${catatan}`);
            const waUrl = `${WA_LINK_BASE}?text=${text}`;
            // buka WA di tab baru agar pengguna tetap melihat konfirmasi di situs
            window.open(waUrl, '_blank', 'noopener');
          }, 900); // 0.9s simulasi kirim
        });

        // restore booking log dari localStorage saat load
        try {
          const saved = JSON.parse(localStorage.getItem('bookingLog') || '[]');
          if (saved.length && bookingLogList) {
            document.querySelector('.booking-log-empty').style.display = 'none';
            saved.forEach((item) => {
              const li = document.createElement('li');
              li.innerHTML = `<strong>${item.nama}</strong> (${item.wa}) — ${item.jadwal}<br/><small>${item.catatan ? item.catatan + ' — ' : ''}${item.time}</small>`;
              bookingLogList.appendChild(li);
            });
          }
        } catch (err) {
          /* ignore */
        }
      }

      // small UX: hide FAB on very small view while keyboard up (mobile)
      const waFab = document.getElementById('wa-fab');
      if (waFab) {
        let fabTimeout = null;
        window.addEventListener('resize', () => {
          if (fabTimeout) clearTimeout(fabTimeout);
          // hide briefly during resize (mobile keyboard)
          waFab.style.opacity = '1';
          fabTimeout = setTimeout(() => {
            waFab.style.opacity = '1';
          }, 400);
        });
      }

      // BONUS: smooth scroll for nav links (ensures contact nav works)
      const navDataLinks = document.querySelectorAll('a[data-nav]');
      navDataLinks.forEach((link) => {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (!target) return;
          const navbar = document.querySelector('.navbar');
          const offset = navbar ? navbar.offsetHeight + 8 : 0;
          const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });

          navDataLinks.forEach((n) => n.classList.remove('active'));
          this.classList.add('active');
        });
      });

      // Reset pesan
      formMessage.textContent = '';
      formMessage.classList.remove('error', 'success');

      // Validasi sederhana
      if (!nama || !wa || !jadwal) {
        formMessage.textContent = 'Nama, WhatsApp, dan Jam/Paket wajib diisi.';
        formMessage.classList.add('error');
        return;
      }

      // Simulasi "mengirim..."
      bookingBtn.disabled = true;
      const originalText = bookingBtn.innerHTML;
      bookingBtn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i><span>Mengirim...</span>`;

      setTimeout(() => {
        bookingBtn.disabled = false;
        bookingBtn.innerHTML = originalText;

        // Pesan sukses
        formMessage.textContent = 'Permintaan booking terkirim. Admin akan menghubungi lewat WhatsApp.';
        formMessage.classList.add('success');

        // Tambahkan ke log (fake data)
        if (bookingLogEmpty) {
          bookingLogEmpty.style.display = 'none';
        }

        const li = document.createElement('li');
        const timeStr = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });
        li.innerHTML = `
          <strong>${nama}</strong> (${wa})<br/>
          <span>${jadwal}</span><br/>
          <small>${catatan ? 'Catatan: ' + catatan + '<br/>' : ''}Waktu kirim: ${timeStr}</small>
        `;
        bookingLogList.prepend(li);

        // Reset form
        bookingForm.reset();
      }, 1200); // 1.2 detik simulasi kirim
    });
  }
  // ------- Parallax ringan di area HERO ketika mouse bergerak -------
  const heroSection = document.querySelector('.hero');
  const heroInner = document.querySelector('.hero-inner');

  if (heroSection && heroInner) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left; // posisi mouse di dalam hero
      const y = e.clientY - rect.top;

      const moveX = (x / rect.width - 0.5) * 10; // -5 sampai 5
      const moveY = (y / rect.height - 0.5) * 10; // -5 sampai 5

      heroInner.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });

    heroSection.addEventListener('mouseleave', () => {
      heroInner.style.transform = 'translate3d(0, 0, 0)';
    });
  }
  // ------- Klik Paket -> Animasi + Scroll ke Form + Auto Isi -------
  const paketCards = document.querySelectorAll('.pricing-card');
  const jadwalInput = document.getElementById('jadwal');
  const formSection = document.getElementById('kontak');

  paketCards.forEach((card) => {
    card.addEventListener('click', () => {
      const paket = card.getAttribute('data-paket');

      // Animasi bounce
      card.classList.add('clicked');
      setTimeout(() => card.classList.remove('clicked'), 400);

      // Auto isi form
      if (jadwalInput) {
        jadwalInput.value = paket;
      }

      // Auto scroll ke form booking
      formSection.scrollIntoView({ behavior: 'smooth' });
    });
  });
  /* ===== ENHANCEMENTS: sound (WebAudio), toast, count-up, WA menu, two-admin, UX ===== */

  /////////////////////
  // 1) Sound helper (WebAudio, no files)
  /////////////////////
  const AudioPlay = (() => {
    let ctx = null;
    function ensure() {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return {
      click(freq = 880, duration = 0.06, type = 'sine') {
        try {
          ensure();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = type;
          o.frequency.value = freq;
          o.connect(g);
          g.connect(ctx.destination);
          g.gain.value = 0.0001;
          const now = ctx.currentTime;
          g.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
          o.start(now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
          o.stop(now + duration + 0.02);
        } catch (e) {
          /* ignore autoplay blocked errors */
        }
      },
    };
  })();

  /////////////////////
  // 2) Toast helper
  /////////////////////
  const toastContainer = document.getElementById('toast-container');
  function showToast(message, type = 'success', timeout = 3000) {
    if (!toastContainer) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<div style="flex:1">${message}</div>`;
    toastContainer.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(10px)';
    }, timeout);
    setTimeout(() => t.remove(), timeout + 400);
  }

  /////////////////////
  // 3) Count-up stat (trigger when visible)
  /////////////////////
  const statEl = document.getElementById('stat-count'); // ensure your stat has id="stat-count"
  if (statEl) {
    // if not numeric, parse from text
    const target = parseInt(statEl.textContent.replace(/\D/g, '')) || 30;
    statEl.textContent = '0';
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting && !started) {
            started = true;
            const duration = 1200;
            const start = performance.now();
            const from = 10; // start value
            function step(ts) {
              const p = Math.min(1, (ts - start) / duration);
              const value = Math.round(from + (target - from) * p);
              statEl.textContent = `${value}–${target}`;
              if (p < 1) requestAnimationFrame(step);
              else statEl.textContent = `${from}–${target}`;
            }
            requestAnimationFrame(step);
            io.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    io.observe(document.querySelector('.about-card') || statEl);
  }

  /////////////////////
  // 4) Enhanced booking form logic (merge with existing)
  /////////////////////
  const bookingFormEl = document.getElementById('booking-form');
  if (bookingFormEl) {
    const bookingBtnEl = document.getElementById('booking-btn');
    const formMessage = document.getElementById('form-message');
    const bookingLogList = document.querySelector('.booking-log-list');
    const bookingLogEmpty = document.querySelector('.booking-log-empty');

    // two admin WA numbers
    const WA_NUM1 = '62895635383351';
    const WA_NUM2 = '62895334400481';

    bookingFormEl.addEventListener('submit', (ev) => {
      ev.preventDefault();
      AudioPlay.click(900, 0.06);

      const nama = document.getElementById('nama').value.trim();
      const wa = document.getElementById('wa').value.trim();
      const jadwal = document.getElementById('jadwal').value.trim();
      const catatan = document.getElementById('catatan').value.trim();

      formMessage.textContent = '';
      formMessage.classList.remove('error', 'success');

      if (!nama || !wa || !jadwal) {
        formMessage.textContent = 'Nama, WhatsApp, dan Jam/Paket wajib diisi.';
        formMessage.classList.add('error');
        showToast('Lengkapi semua field.', 'error', 2200);
        AudioPlay.click(480, 0.08);
        return;
      }

      bookingBtnEl.disabled = true;
      const original = bookingBtnEl.innerHTML;
      bookingBtnEl.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Mengirim...`;

      setTimeout(() => {
        bookingBtnEl.disabled = false;
        bookingBtnEl.innerHTML = original;

        formMessage.textContent = 'Permintaan booking terkirim. Mengarahkan ke WhatsApp...';
        formMessage.classList.add('success');
        showToast('Booking terkirim — akan membuka WhatsApp.', 'success', 2400);
        AudioPlay.click(1200, 0.05);

        // push to log and localStorage
        const timeStr = new Date().toLocaleString();
        if (bookingLogEmpty) bookingLogEmpty.style.display = 'none';
        if (bookingLogList) {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${nama}</strong> (${wa}) — ${jadwal}<br/><small>${catatan ? catatan + ' — ' : ''}${timeStr}</small>`;
          bookingLogList.prepend(li);
        }
        try {
          const prev = JSON.parse(localStorage.getItem('bookingLog') || '[]');
          prev.unshift({ nama, wa, jadwal, catatan, time: timeStr });
          localStorage.setItem('bookingLog', JSON.stringify(prev.slice(0, 40)));
        } catch (e) {}

        bookingFormEl.reset();

        // open WA choose admin: show prompt to choose admin then open corresponding WA
        const text = encodeURIComponent(`Halo Febri & Rizky, saya ${nama}. Saya mau booking: ${jadwal}. WA: ${wa}. Catatan: ${catatan}`);
        // open link to admin 1 by default; for better UX, open a small choice menu:
        const choose = confirm('Mau kirim ke Admin 1? (OK = Admin 1, Cancel = Admin 2)');
        const num = choose ? WA_NUM1 : WA_NUM2;
        window.open(`https://wa.me/${num}?text=${text}`, '_blank', 'noopener');
      }, 900);
    });

    // restore logs
    try {
      const saved = JSON.parse(localStorage.getItem('bookingLog') || '[]');
      if (saved.length && bookingLogList) {
        document.querySelector('.booking-log-empty').style.display = 'none';
        saved.forEach((item) => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${item.nama}</strong> (${item.wa}) — ${item.jadwal}<br/><small>${item.catatan ? item.catatan + ' — ' : ''}${item.time}</small>`;
          bookingLogList.appendChild(li);
        });
      }
    } catch (e) {}
  }

  /////////////////////
  // 5) WA FAB menu interactions
  /////////////////////
  const waFabBtn = document.getElementById('wa-fab');
  const waMenu = document.getElementById('wa-menu');
  if (waFabBtn && waMenu) {
    waFabBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const visible = waMenu.style.display === 'block';
      if (visible) {
        waMenu.style.display = 'none';
      } else {
        waMenu.style.display = 'block';
        AudioPlay.click(760, 0.06);
      }
    });

    document.querySelectorAll('.wa-admin').forEach((a) => {
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        AudioPlay.click(900, 0.06);
        const num = a.getAttribute('data-wa');
        const text = encodeURIComponent('Halo, saya mau tanya ketersediaan booking.');
        window.open(`https://wa.me/${num}?text=${text}`, '_blank', 'noopener');
        waMenu.style.display = 'none';
      });
    });

    // hide menu if click outside
    document.addEventListener('click', (ev) => {
      if (!waMenu.contains(ev.target) && ev.target !== waFabBtn) waMenu.style.display = 'none';
    });
  }

  /////////////////////
  // 6) small UX: click sounds on certain interactive elements
  /////////////////////
  document.querySelectorAll('a, button, .pricing-card, .nav-links a').forEach((el) => {
    el.addEventListener('click', () => {
      AudioPlay.click(840, 0.05);
    });
  });
});
