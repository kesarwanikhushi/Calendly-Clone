import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function BookingForm({ questions = [], onSubmit, isSubmitting }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});

  function updateAnswer(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function validate() {
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!validateEmail(email)) errs.email = "Invalid email format";

    questions.forEach((q) => {
      if (q.required && (!answers[q.id] || !answers[q.id].trim())) {
        errs[`q_${q.id}`] = "This field is required";
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const formattedAnswers = questions
      .filter((q) => answers[q.id] && answers[q.id].trim())
      .map((q) => ({ questionId: q.id, value: answers[q.id].trim() }));

    onSubmit({
      inviteeName: name.trim(),
      inviteeEmail: email.trim(),
      answers: formattedAnswers,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Your Name"
        id="invitee-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="John Doe"
      />
      <Input
        label="Your Email"
        id="invitee-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="john@example.com"
      />
      {questions.map((q) => (
        <Input
          key={q.id}
          label={`${q.label}${q.required ? " *" : ""}`}
          id={`question-${q.id}`}
          value={answers[q.id] || ""}
          onChange={(e) => updateAnswer(q.id, e.target.value)}
          error={errors[`q_${q.id}`]}
        />
      ))}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Scheduling..." : "Schedule Meeting"}
      </Button>
    </form>
  );
}
