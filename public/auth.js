(() => {
  const page = document.querySelector(".auth-shell")?.getAttribute("data-page") || "";

  const getConfig = () => {
    const url = window.__SUPABASE_URL__;
    const key = window.__SUPABASE_ANON_KEY__;
    return { url, key };
  };

  const { url, key } = getConfig();

  const setStatus = (id, message, isError = false) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.style.color = isError ? "rgba(255, 120, 120, 0.92)" : "rgba(214, 232, 220, 0.72)";
  };

  const setFieldError = (name, message) => {
    const el = document.querySelector(`[data-error-for="${name}"]`);
    if (!el) return;
    el.textContent = message || "";
  };

  const clearAllFieldErrors = (form) => {
    form.querySelectorAll("[data-error-for]").forEach((el) => {
      el.textContent = "";
    });
  };

  const toggleLoading = (button, isLoading) => {
    if (!button) return;
    button.classList.toggle("loading", Boolean(isLoading));
    button.disabled = Boolean(isLoading);
  };

  const wirePasswordToggles = () => {
    document.querySelectorAll("[data-toggle-password]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const control = btn.closest(".field__control");
        const input = control?.querySelector("input");
        if (!input) return;

        const nextType = input.type === "password" ? "text" : "password";
        input.type = nextType;

        const label = btn.querySelector("[data-toggle-label]");
        if (label) label.textContent = nextType === "password" ? "Mostrar" : "Ocultar";
      });
    });
  };

  const scorePassword = (value) => {
    const v = String(value || "");
    if (!v) return { score: 0, label: "Use letras, números e símbolos." };

    let score = 0;
    if (v.length >= 8) score += 25;
    if (v.length >= 12) score += 15;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score += 20;
    if (/\d/.test(v)) score += 20;
    if (/[^\w\s]/.test(v)) score += 20;

    const clamped = Math.max(0, Math.min(100, score));
    const label =
      clamped < 35 ? "Senha fraca" : clamped < 70 ? "Senha média" : clamped < 90 ? "Senha forte" : "Senha excelente";

    return { score: clamped, label };
  };

  const wireStrengthMeter = () => {
    const bar = document.querySelector("[data-strength-bar]");
    const text = document.querySelector("[data-strength-text]");
    const input = document.getElementById("password");
    if (!bar || !text || !input) return;

    const update = () => {
      const { score, label } = scorePassword(input.value);
      bar.style.width = `${score}%`;
      text.textContent = label;
    };

    input.addEventListener("input", update);
    update();
  };

  const validateEmail = (value) => /\S+@\S+\.\S+/.test(String(value || ""));

  const ensureSupabase = () => {
    if (!url || !key) {
      throw new Error("Supabase não configurado. Verifique public/auth-config.js");
    }

    if (!window.supabase?.createClient) {
      throw new Error("Supabase JS não carregado.");
    }

    return window.supabase.createClient(url, key);
  };

  const wireForgotPassword = () => {
    const link = document.getElementById("forgotPassword");
    if (!link) return;

    link.addEventListener("click", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email")?.value || "";
      if (!validateEmail(email)) {
        setFieldError("email", "Informe um e-mail válido para recuperar a senha.");
        return;
      }

      try {
        const client = ensureSupabase();
        setStatus("loginStatus", "Enviando link de recuperação...");
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setStatus("loginStatus", "Se o e-mail existir, enviaremos as instruções.");
      } catch (err) {
        console.error(err);
        setStatus("loginStatus", "Não foi possível enviar o link agora.", true);
      }
    });
  };

  const wireLogin = () => {
    const form = document.getElementById("loginForm");
    const submit = document.getElementById("loginSubmit");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAllFieldErrors(form);
      setStatus("loginStatus", "");

      const email = form.email?.value?.trim();
      const password = form.password?.value || "";

      let hasError = false;
      if (!validateEmail(email)) {
        setFieldError("email", "E-mail inválido.");
        hasError = true;
      }
      if (String(password).length < 6) {
        setFieldError("password", "Senha deve ter pelo menos 6 caracteres.");
        hasError = true;
      }
      if (hasError) return;

      try {
        toggleLoading(submit, true);
        setStatus("loginStatus", "Entrando...");
        const client = ensureSupabase();

        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        setStatus("loginStatus", "Login realizado. Redirecionando...");
        window.location.href = "/";
      } catch (err) {
        console.error(err);
        setStatus("loginStatus", "Falha no login. Verifique e-mail e senha.", true);
      } finally {
        toggleLoading(submit, false);
      }
    });
  };

  const wireRegister = () => {
    const form = document.getElementById("registerForm");
    const submit = document.getElementById("registerSubmit");
    if (!form) return;

    const validateLive = () => {
      const username = form.username?.value?.trim() || "";
      const email = form.email?.value?.trim() || "";
      const password = form.password?.value || "";
      const confirmPassword = form.confirmPassword?.value || "";
      const country = form.country?.value || "";
      const terms = Boolean(form.terms?.checked);

      setFieldError("username", username.length >= 3 ? "" : "Use 3 a 20 caracteres.");
      setFieldError("email", validateEmail(email) ? "" : "E-mail inválido.");
      setFieldError("password", String(password).length >= 6 ? "" : "Senha deve ter pelo menos 6 caracteres.");
      setFieldError(
        "confirmPassword",
        confirmPassword && confirmPassword === password ? "" : "As senhas não coincidem."
      );
      setFieldError("country", country ? "" : "Selecione um país.");
      setFieldError("terms", terms ? "" : "Você precisa aceitar os termos.");
    };

    form.addEventListener("input", validateLive);
    form.addEventListener("change", validateLive);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      setStatus("registerStatus", "");
      validateLive();

      const username = form.username?.value?.trim() || "";
      const email = form.email?.value?.trim() || "";
      const password = form.password?.value || "";
      const confirmPassword = form.confirmPassword?.value || "";
      const country = form.country?.value || "";
      const terms = Boolean(form.terms?.checked);

      const isValid =
        username.length >= 3 &&
        username.length <= 20 &&
        validateEmail(email) &&
        String(password).length >= 6 &&
        password === confirmPassword &&
        Boolean(country) &&
        terms;

      if (!isValid) {
        setStatus("registerStatus", "Revise os campos destacados.", true);
        return;
      }

      try {
        toggleLoading(submit, true);
        setStatus("registerStatus", "Criando conta...");
        const client = ensureSupabase();

        const { error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              country,
            },
          },
        });
        if (error) throw error;

        setStatus("registerStatus", "Conta criada. Verifique seu e-mail para confirmar, se necessário.");
        setTimeout(() => {
          window.location.href = "/login.html";
        }, 900);
      } catch (err) {
        console.error(err);
        setStatus("registerStatus", "Não foi possível criar sua conta.", true);
      } finally {
        toggleLoading(submit, false);
      }
    });

    validateLive();
  };

  wirePasswordToggles();
  wireStrengthMeter();

  if (page === "login") {
    wireForgotPassword();
    wireLogin();
  }

  if (page === "register") {
    wireRegister();
  }
})();
