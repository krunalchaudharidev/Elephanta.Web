import React, { useState } from "react";
import {
  ArrowRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const contactDetails = [
  {
    icon: Phone,
    title: "Call Us",
    description: "Speak with our jewellery experts.",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: Mail,
    title: "Email Us",
    description: "We would love to hear from you.",
    value: "support@elephanta.com",
    href: "mailto:support@elephanta.com",
  },
  {
    icon: Clock,
    title: "Business Hours",
    description: "Our team is available to help.",
    value: "Mon – Sat, 10 AM – 7 PM",
    href: null,
  },
];

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Product Enquiry",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Connect this handler to your .NET Contact Us API.
    console.log("Contact form submission:", form);
    setSubmitted(true);
  };

  const inputClass =
    "w-full rounded-md border border-[#e8e0d6] bg-white px-4 py-3 text-sm text-[#17251f] outline-none transition placeholder:text-[#aaa198] focus:border-[#a77b4c] focus:ring-2 focus:ring-[#a77b4c]/10";

  return (
    <main className="min-h-screen bg-[#fcfaf7] text-[#17251f]">
      {/* Page hero */}
      <section className="relative overflow-hidden bg-[#102923]">
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-[#c4a16e]/20" />
        <div className="absolute -right-8 -top-20 h-64 w-64 rounded-full border border-[#c4a16e]/20" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d7b57b]">
              <Sparkles size={14} />
              We're Here for You
            </div>

            <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
              Let's Start a
              <span className="block italic text-[#d7b57b]">
                Conversation.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-7 text-white/70 sm:text-base">
              Whether you need help choosing the perfect piece, have a
              question about your order, or simply want to say hello,
              our team is ready to help.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-white/80">
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#d7b57b]" />
                Personalised assistance
              </span>
              <span className="hidden h-4 w-px bg-white/25 sm:block" />
              <span className="flex items-center gap-2">
                <MessageCircle size={16} className="text-[#d7b57b]" />
                We're happy to help
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="mx-auto -mt-1 max-w-7xl px-5 py-8 sm:px-10 lg:px-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contactDetails.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-xl border border-[#eee6dc] bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#342619]/5 sm:p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5eee5] text-[#a77b4c]">
                  <Icon size={20} strokeWidth={1.5} />
                </div>

                <h2 className="mt-5 font-serif text-xl">
                  {item.title}
                </h2>

                <p className="mt-2 text-xs leading-5 text-[#827c73]">
                  {item.description}
                </p>

                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-4 inline-flex items-center gap-2 break-all text-sm font-medium text-[#91683f] hover:text-[#17251f]"
                  >
                    {item.value}
                    <ArrowRight size={14} />
                  </a>
                ) : (
                  <p className="mt-4 text-sm font-medium">
                    {item.value}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact form and supporting information */}
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-5 sm:px-10 lg:px-14 lg:pb-24">
        <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          {/* Form */}
          <div className="rounded-xl border border-[#eee6dc] bg-white p-5 shadow-sm sm:p-8 lg:p-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a77b4c]">
              GET IN TOUCH
            </p>

            <h2 className="mt-3 font-serif text-3xl">
              Send Us a Message
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#827c73]">
              Fill in the details below and tell us how we can assist you.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs font-medium"
                  >
                    Full Name <span className="text-[#a77b4c]">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    maxLength={100}
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-medium"
                  >
                    Email Address <span className="text-[#a77b4c]">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-xs font-medium"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    maxLength={20}
                    autoComplete="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 00000 00000"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-xs font-medium"
                  >
                    What can we help with?
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option>Product Enquiry</option>
                    <option>Order Status</option>
                    <option>Shipping & Delivery</option>
                    <option>Returns & Refunds</option>
                    <option>Custom Jewellery</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-xs font-medium"
                >
                  Your Message <span className="text-[#a77b4c]">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  minLength={10}
                  maxLength={3000}
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us a little about your enquiry..."
                  className={`${inputClass} resize-y`}
                />
                <p className="mt-1 text-right text-[10px] text-[#9a9289]">
                  {form.message.length}/3000
                </p>
              </div>

              {submitted && (
                <div
                  role="status"
                  className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800"
                >
                  Your message has been validated. Connect the contact API
                  to send it to our team.
                </div>
              )}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-[#142a23] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#a77b4c] sm:w-auto"
              >
                Send Message
                <Send size={16} />
              </button>

              <p className="text-[11px] leading-5 text-[#8c857b]">
                By submitting this form, you agree that we may use your
                details to respond to your enquiry.
              </p>
            </form>
          </div>

          {/* Contact information */}
          <aside className="space-y-6 lg:pt-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a77b4c]">
                THE ELEPHANTA EXPERIENCE
              </p>

              <h2 className="mt-3 font-serif text-3xl leading-snug sm:text-4xl">
                Every detail matters.
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#77766f]">
                Jewellery is more than an accessory. It's a memory, a
                milestone, and a story worth celebrating. We're here to
                help you find something truly special.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl bg-[#f1e8dc]">
              <img
                src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1000&q=85"
                alt="Elegant jewellery details"
                loading="lazy"
                className="h-64 w-full object-cover sm:h-80"
              />
            </div>

            <div className="rounded-xl border border-[#e9dfd2] bg-[#f7f1e9] p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#a77b4c]">
                  <MessageCircle size={21} />
                </span>

                <div>
                  <h3 className="font-serif text-xl">
                    Need a little guidance?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#777066]">
                    Have questions about sizing, styling, or choosing a
                    gift? Our team is happy to help you make the right
                    choice.
                  </p>
                  <a
                    href="mailto:support@elephanta.com"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#91683f] hover:text-[#17251f]"
                  >
                    Talk to our team
                    <ArrowRight size={15} />
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
