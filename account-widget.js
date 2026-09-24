/*
 * account-widget.js
 * Widget "Member / Guest" dùng chung cho mọi trang (trừ index.html, nơi đã
 * có sẵn markup + logic tương đương).
 *
 * Cách dùng trong 1 trang HTML:
 *   1) Đặt  <div id="account-widget-slot"></div>  bên trong .nav-right của navbar.
 *   2) Ngay trước </body>, include ĐÚNG THỨ TỰ (không dùng defer/async):
 *        <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
 *        <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
 *        <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
 *        <script src="account-widget.js"></script>
 */
(function () {
  var ACCOUNT_WIDGET_HTML = `
    <div class="account-menu">
      <button class="account-pill" id="account-toggle" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="account-dropdown">
        <span class="account-avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>
        </span>
        <span class="account-text">
          <span class="account-name" id="account-name">Guest</span>
          <span class="account-role" id="account-role"><span class="dot"></span>GUEST</span>
        </span>
        <svg class="account-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>

      <div class="account-dropdown" id="account-dropdown" hidden>
        <div id="account-guest-content">
          <div class="account-welcome">
            <p class="welcome-title">Welcome! 👋</p>
            <p class="welcome-text">Sign in to save your progress and receive personalized learning path.</p>
          </div>

          <a class="account-action" href="hoc-tap-demo.html?mode=login">
            <span class="action-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M9 17l5-5-5-5"/><path d="M14 12H3"/></svg>
            </span>
            <span>Sign in</span>
          </a>
          <a class="account-action" href="hoc-tap-demo.html?mode=signup">
            <span class="action-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="7.5" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>
            </span>
            <span>New here? Create your new account</span>
          </a>
        </div>

        <div id="account-member-content" hidden>
          <div class="account-welcome">
            <p class="welcome-title" id="account-member-greeting">Chào! 👋</p>
            <p class="welcome-text" id="account-member-email"></p>
          </div>

          <a class="account-action" href="profile.html">
            <span class="action-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>
            </span>
            <span>My profile</span>
          </a>
          <a class="account-action" href="#">
            <span class="action-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </span>
            <span>My vocab notebook</span>
          </a>

          <button class="account-action" id="btn-sign-out" type="button">
            <span class="action-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
            </span>
            <span>Sign out</span>
          </button>

          <div class="account-danger">
            <button class="account-action account-action-danger" id="btn-delete-account" type="button" aria-expanded="false" aria-controls="delete-confirm">
              <span class="action-icon action-icon-danger">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              </span>
              <span>Delete account</span>
            </button>

            <div class="delete-confirm" id="delete-confirm" hidden>
              <p class="delete-confirm-text">This permanently deletes your account and saved progress. Enter your password to confirm.</p>
              <input type="password" id="delete-password" placeholder="Password" autocomplete="current-password" />
              <div class="msg" id="delete-msg"></div>
              <div class="delete-confirm-actions">
                <button type="button" class="btn-mini btn-mini-ghost" id="btn-delete-cancel">Cancel</button>
                <button type="button" class="btn-mini btn-mini-danger" id="btn-delete-confirm">Delete my account</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyDX1lJ_xBPAgWpireowMwQMbrmof7gtHfQ",
    authDomain: "hocvoihanh.firebaseapp.com",
    projectId: "hocvoihanh",
    storageBucket: "hocvoihanh.firebasestorage.app",
    messagingSenderId: "447968761171",
    appId: "1:447968761171:web:8d4ec91591fd02dd22fda6",
    measurementId: "G-X94RF3RXCT"
  };

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var slot = document.getElementById('account-widget-slot');
    if (!slot) return; // trang chưa có chỗ gắn widget thì bỏ qua
    slot.innerHTML = ACCOUNT_WIDGET_HTML;
    initAccountWidget();
  });

  function initAccountWidget() {
    if (!window.firebase || !firebase.apps) {
      console.error('account-widget.js: Firebase SDK chưa được tải trước script này.');
      return;
    }
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    var auth = firebase.auth();
    var db = firebase.firestore();

    var accountName = document.getElementById('account-name');
    var accountRole = document.getElementById('account-role');
    var guestContent = document.getElementById('account-guest-content');
    var memberContent = document.getElementById('account-member-content');
    var memberEmail = document.getElementById('account-member-email');
    var memberGreeting = document.getElementById('account-member-greeting');
    var btnSignOut = document.getElementById('btn-sign-out');

    function setDisplayName(name) {
      accountName.textContent = name;
      memberGreeting.textContent = 'Chào ' + name + '! 👋';
    }

    auth.onAuthStateChanged(function (user) {
      if (user) {
        accountRole.innerHTML = '<span class="dot"></span>MEMBER';
        memberEmail.textContent = user.email;
        guestContent.hidden = true;
        memberContent.hidden = false;

        // Hiển thị tạm trong lúc chờ đọc username từ Firestore (nguồn dữ liệu
        // đáng tin cậy hơn user.displayName, vì displayName của Firebase Auth
        // đôi khi chưa kịp đồng bộ ngay sau khi vừa tạo tài khoản).
        setDisplayName(user.displayName || user.email.split('@')[0]);

        db.collection('users').doc(user.uid).get()
          .then(function (doc) {
            var savedUsername = doc.exists ? doc.data().username : null;
            if (savedUsername) setDisplayName(savedUsername);
          })
          .catch(function () {});
      } else {
        accountName.textContent = 'Guest';
        accountRole.innerHTML = '<span class="dot"></span>GUEST';
        guestContent.hidden = false;
        memberContent.hidden = true;
      }
    });

    if (btnSignOut) {
      btnSignOut.addEventListener('click', function () {
        auth.signOut().then(function () { location.reload(); });
      });
    }

    // ---- Delete account ----
    (function () {
      var btnDeleteAccount = document.getElementById('btn-delete-account');
      var deleteConfirm = document.getElementById('delete-confirm');
      var deletePassword = document.getElementById('delete-password');
      var deleteMsg = document.getElementById('delete-msg');
      var btnDeleteCancel = document.getElementById('btn-delete-cancel');
      var btnDeleteConfirm = document.getElementById('btn-delete-confirm');
      if (!btnDeleteAccount || !deleteConfirm) return;

      function resetDeletePanel() {
        deleteConfirm.hidden = true;
        btnDeleteAccount.setAttribute('aria-expanded', 'false');
        deletePassword.value = '';
        deleteMsg.textContent = '';
        deleteMsg.className = 'msg';
        btnDeleteConfirm.disabled = false;
        btnDeleteConfirm.textContent = 'Delete my account';
      }

      btnDeleteAccount.addEventListener('click', function () {
        var willOpen = deleteConfirm.hidden;
        resetDeletePanel();
        deleteConfirm.hidden = !willOpen;
        btnDeleteAccount.setAttribute('aria-expanded', String(willOpen));
        if (willOpen) deletePassword.focus();
      });

      btnDeleteCancel.addEventListener('click', resetDeletePanel);

      btnDeleteConfirm.addEventListener('click', function () {
        var user = auth.currentUser;
        if (!user) return;
        var password = deletePassword.value;
        if (!password) {
          deleteMsg.textContent = 'Please enter your password.';
          deleteMsg.className = 'msg error';
          return;
        }

        btnDeleteConfirm.disabled = true;
        btnDeleteConfirm.textContent = 'Deleting…';
        deleteMsg.textContent = '';
        deleteMsg.className = 'msg';

        var credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
        user.reauthenticateWithCredential(credential)
          .then(function () { return db.collection('users').doc(user.uid).delete().catch(function () {}); })
          .then(function () { return user.delete(); })
          .then(function () { location.reload(); })
          .catch(function (err) {
            btnDeleteConfirm.disabled = false;
            btnDeleteConfirm.textContent = 'Delete my account';
            var map = {
              'auth/wrong-password': 'Incorrect password.',
              'auth/invalid-credential': 'Incorrect password.',
              'auth/too-many-requests': 'Too many attempts. Please try again later.',
              'auth/requires-recent-login': 'Please sign out and sign in again, then retry.'
            };
            deleteMsg.textContent = map[err.code] || ('Something went wrong: ' + err.message);
            deleteMsg.className = 'msg error';
          });
      });
    })();

    // ---- Dropdown toggle ----
    (function () {
      var toggle = document.getElementById('account-toggle');
      var dropdown = document.getElementById('account-dropdown');
      var menu = toggle && toggle.closest('.account-menu');
      if (!toggle || !dropdown || !menu) return;

      function closeMenu() {
        dropdown.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      }
      function openMenu() {
        dropdown.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        menu.classList.add('is-open');
      }

      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdown.hidden ? openMenu() : closeMenu();
      });
      document.addEventListener('click', function (e) {
        if (!menu.contains(e.target)) closeMenu();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });
    })();
  }
})();
