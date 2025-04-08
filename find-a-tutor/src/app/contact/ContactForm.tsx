"use client";

import { FormEvent, useState } from "react";

interface Props {
  className?: string;
  /* TODO: Add Additional Props Here */
}

export function ContactForm({ className }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");



  // TODO: Attach this function to the form like so <form onSubmit={onSubmit}>
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true); // Start Loading

    try {
      const formData = new FormData(event.currentTarget);

      // TODO: Remove mock delay for testing
      const seconds = 1.5;
      await new Promise(resolve => setTimeout(resolve, seconds * 1000));

      // TODO: Implement API calls with formData (we don't need to worry about this part!)
      console.log(formData)

    } catch (error) {
      // Error Handling
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
  <div className={`${className}`}>
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input 
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required />
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required />
      </div>

      <div>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Sending..." : "Submit"}
      </button>
    </form>
  </div>
  );
}
