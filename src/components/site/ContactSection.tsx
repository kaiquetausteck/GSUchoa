import {
  ArrowRight,
  Clock,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { submitPublicContactRequest } from "../../services/site/contact-api";
import { RevealSection } from "./RevealSection";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const SUCCESS_COOLDOWN_MS = 8000;
const DUPLICATE_WINDOW_MS = 45000;
const SUBMIT_GUARD_MS = 800;

type ContactFormData = {
  fullName: string;
  email: string;
  whatsapp: string;
  message: string;
};

type ContactFormErrors = Partial<Record<keyof ContactFormData, string>>;

function normalizeWhatsappDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

function formatBrazilianWhatsapp(value: string) {
  const digits = normalizeWhatsappDigits(value);

  if (!digits) {
    return "";
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value.trim());
}

function validateContactForm(formData: ContactFormData) {
  const errors: ContactFormErrors = {};

  if (!formData.fullName.trim()) {
    errors.fullName = "Informe seu nome completo.";
  }

  if (!formData.email.trim()) {
    errors.email = "Informe seu e-mail corporativo.";
  } else if (!isValidEmail(formData.email)) {
    errors.email = "Informe um e-mail válido.";
  }

  const whatsappDigits = normalizeWhatsappDigits(formData.whatsapp);
  if (!whatsappDigits) {
    errors.whatsapp = "Informe seu WhatsApp.";
  } else if (whatsappDigits.length < 10) {
    errors.whatsapp = "Informe um WhatsApp válido com DDD.";
  }

  if (!formData.message.trim()) {
    errors.message = "Conte brevemente qual é o seu desafio.";
  }

  return errors;
}

export function ContactSection() {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: "",
    email: "",
    whatsapp: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState<ContactFormErrors>({});
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const submitLockRef = useRef(false);
  const lastSubmitAttemptRef = useRef(0);
  const lastSuccessRef = useRef<{ signature: string; submittedAt: number } | null>(null);
  const cooldownTimeoutRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (cooldownTimeoutRef.current) {
      window.clearTimeout(cooldownTimeoutRef.current);
    }
  }, []);

  const isCooldownActive = cooldownUntil !== null;

  const startSuccessCooldown = () => {
    if (cooldownTimeoutRef.current) {
      window.clearTimeout(cooldownTimeoutRef.current);
    }

    const nextCooldownUntil = Date.now() + SUCCESS_COOLDOWN_MS;
    setCooldownUntil(nextCooldownUntil);
    cooldownTimeoutRef.current = window.setTimeout(() => {
      setCooldownUntil(null);
      setSubmitState("idle");
      setFeedbackMessage("");
    }, SUCCESS_COOLDOWN_MS);
  };

  const handleFieldChange = <Field extends keyof ContactFormData>(field: Field, value: ContactFormData[Field]) => {
    setFormData((current) => ({
      ...current,
      [field]: field === "whatsapp" ? formatBrazilianWhatsapp(String(value)) : value,
    }));

    setFormErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });

    if (submitState === "error") {
      setSubmitState("idle");
      setFeedbackMessage("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const now = Date.now();

    if (submitLockRef.current || submitState === "loading") {
      return;
    }

    if (now - lastSubmitAttemptRef.current < SUBMIT_GUARD_MS) {
      return;
    }

    lastSubmitAttemptRef.current = now;

    if (cooldownUntil && now < cooldownUntil) {
      setSubmitState("success");
      setFeedbackMessage("Solicitação enviada com sucesso. Nossa equipe entrará em contato.");
      return;
    }

    const errors = validateContactForm(formData);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitState("error");
      setFeedbackMessage("Revise os campos destacados antes de enviar.");
      return;
    }

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      whatsapp: formatBrazilianWhatsapp(formData.whatsapp),
      message: formData.message.trim(),
      source: "site_contact_form",
    };
    const payloadSignature = JSON.stringify(payload);

    if (
      lastSuccessRef.current &&
      lastSuccessRef.current.signature === payloadSignature &&
      now - lastSuccessRef.current.submittedAt < DUPLICATE_WINDOW_MS
    ) {
      setSubmitState("success");
      setFeedbackMessage("Solicitação enviada com sucesso. Nossa equipe entrará em contato.");
      startSuccessCooldown();
      return;
    }

    submitLockRef.current = true;
    setSubmitState("loading");
    setFeedbackMessage("");
    setFormErrors({});

    try {
      const response = await submitPublicContactRequest(payload);

      lastSuccessRef.current = {
        signature: payloadSignature,
        submittedAt: Date.now(),
      };
      setFormData({
        fullName: "",
        email: "",
        whatsapp: "",
        message: "",
      });
      setSubmitState("success");
      setFeedbackMessage(response.message || "Solicitação enviada com sucesso. Nossa equipe entrará em contato.");
      startSuccessCooldown();
    } catch (error) {
      setSubmitState("error");
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar sua solicitação agora. Tente novamente em instantes.",
      );
    } finally {
      submitLockRef.current = false;
    }
  };

  return (
    <RevealSection className="site-section relative overflow-hidden bg-surface" id="contato">
      <div className="hero-gradient absolute inset-0 opacity-30" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid items-center gap-24 lg:grid-cols-2">
          <motion.div
            className="space-y-12"
            initial={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.75, ease: EASE_OUT }}
            viewport={{ once: true, amount: 0.3 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <div>
              <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.4em] text-primary">
                Vamos falar sobre o seu objetivo
              </h2>
              <h3 className="mb-8 text-5xl font-black leading-none tracking-tighter md:text-6xl">
                Sua empresa está pronta para o <span className="text-gradient">próximo nível?</span>
              </h3>
              <p className="max-w-lg text-xl font-light leading-relaxed text-on-surface-variant">
                Cada marca chega até nós com um objetivo diferente. Mais vendas, mais
                autoridade, uma presença mais forte ou uma comunicação mais profissional. Nosso
                papel é entender esse cenário e construir a melhor estratégia para fazer esse
                objetivo acontecer, com comunicação, publicidade e execução alinhadas ao
                resultado que você busca.
              </p>
            </div>

            <div className="grid gap-10 sm:grid-cols-2">
              <div className="space-y-4">
                {[
                  { icon: <MapPin className="h-5 w-5" />, label: "Localização", value: "São Paulo - SP" },
                  { icon: <Phone className="h-5 w-5" />, label: "Telefone", value: "(11) 98955-1228" },
                ].map((item) => (
                  <div key={item.label} className="group flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-high text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        {item.label}
                      </div>
                      <div className="text-sm font-semibold">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {[
                  { icon: <Mail className="h-5 w-5" />, label: "E-mail", value: "contato@gsuchoa.com" },
                  { icon: <Clock className="h-5 w-5" />, label: "Horário", value: "Segunda a sexta, das 9h às 18h" },
                ].map((item) => (
                  <div key={item.label} className="group flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-high text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        {item.label}
                      </div>
                      <div className="text-sm font-semibold">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.75, ease: EASE_OUT }}
            viewport={{ once: true, amount: 0.3 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <div className="absolute -inset-4 rounded-full bg-primary/20 opacity-20 blur-[80px]" />
            <div className="glass-card relative z-10 rounded-[2.5rem] border border-outline-variant/20 p-10 md:p-14">
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary" htmlFor="fullName">
                    Nome completo
                  </label>
                  <input
                    aria-invalid={Boolean(formErrors.fullName)}
                    className={`w-full rounded-2xl border bg-surface-container-high/70 px-6 py-5 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-transparent focus:ring-2 focus:ring-primary/40 ${
                      formErrors.fullName ? "border-red-500/45 focus:ring-red-500/20" : "border-outline-variant/35"
                    }`}
                    id="fullName"
                    onChange={(event) => handleFieldChange("fullName", event.target.value)}
                    placeholder="Como podemos chamar você?"
                    type="text"
                    value={formData.fullName}
                  />
                  {formErrors.fullName ? (
                    <p className="ml-1 text-sm text-red-500">{formErrors.fullName}</p>
                  ) : null}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary" htmlFor="email">
                      E-mail corporativo
                    </label>
                    <input
                      aria-invalid={Boolean(formErrors.email)}
                      className={`w-full rounded-2xl border bg-surface-container-high/70 px-6 py-5 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-transparent focus:ring-2 focus:ring-primary/40 ${
                        formErrors.email ? "border-red-500/45 focus:ring-red-500/20" : "border-outline-variant/35"
                      }`}
                      id="email"
                      onChange={(event) => handleFieldChange("email", event.target.value)}
                      placeholder="email@empresa.com"
                      type="email"
                      value={formData.email}
                    />
                    {formErrors.email ? (
                      <p className="ml-1 text-sm text-red-500">{formErrors.email}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary" htmlFor="whatsapp">
                      WhatsApp
                    </label>
                    <input
                      aria-invalid={Boolean(formErrors.whatsapp)}
                      className={`w-full rounded-2xl border bg-surface-container-high/70 px-6 py-5 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-transparent focus:ring-2 focus:ring-primary/40 ${
                        formErrors.whatsapp ? "border-red-500/45 focus:ring-red-500/20" : "border-outline-variant/35"
                      }`}
                      id="whatsapp"
                      inputMode="tel"
                      onChange={(event) => handleFieldChange("whatsapp", event.target.value)}
                      placeholder="(11) 99999-9999"
                      type="tel"
                      value={formData.whatsapp}
                    />
                    {formErrors.whatsapp ? (
                      <p className="ml-1 text-sm text-red-500">{formErrors.whatsapp}</p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary" htmlFor="message">
                    Mensagem
                  </label>
                  <textarea
                    aria-invalid={Boolean(formErrors.message)}
                    className={`w-full resize-none rounded-2xl border bg-surface-container-high/70 px-6 py-5 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-transparent focus:ring-2 focus:ring-primary/40 ${
                      formErrors.message ? "border-red-500/45 focus:ring-red-500/20" : "border-outline-variant/35"
                    }`}
                    id="message"
                    onChange={(event) => handleFieldChange("message", event.target.value)}
                    placeholder="Conte, em poucas linhas, qual é o seu desafio hoje..."
                    rows={4}
                    value={formData.message}
                  />
                  {formErrors.message ? (
                    <p className="ml-1 text-sm text-red-500">{formErrors.message}</p>
                  ) : null}
                </div>

                <button
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-6 font-bold text-white shadow-[0_15px_35px_rgba(34,98,240,0.25)] transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:brightness-100"
                  disabled={submitState === "loading" || isCooldownActive}
                  type="submit"
                >
                  {submitState === "loading"
                    ? "Enviando solicitação..."
                    : isCooldownActive
                      ? "Solicitação enviada"
                      : "Solicitar análise estratégica"}
                  <ArrowRight className={`h-5 w-5 transition-transform ${submitState === "loading" ? "animate-pulse" : "group-hover:translate-x-1"}`} />
                </button>

                {feedbackMessage ? (
                  <div
                    aria-live="polite"
                    className={`rounded-2xl border px-5 py-4 text-sm leading-relaxed ${
                      submitState === "success"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                        : submitState === "error"
                          ? "border-red-500/20 bg-red-500/10 text-red-500"
                          : "border-outline-variant/20 bg-surface-container-high/70 text-on-surface-variant"
                    }`}
                  >
                    {feedbackMessage}
                  </div>
                ) : null}
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </RevealSection>
  );
}
