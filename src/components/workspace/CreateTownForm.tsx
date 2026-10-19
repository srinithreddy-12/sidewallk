"use client";
import { useActionState } from "react";
import { createTownAction, type CreateTownFormState } from "@/app/workspace/actions";
import styles from "./CreateTownForm.module.css";

const initialState: CreateTownFormState = { values: { name: "", slug: "" } };

export function CreateTownForm() {
  const [state, formAction, pending] = useActionState(createTownAction, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <label htmlFor="town-name">Town name</label>
      <input id="town-name" name="name" required defaultValue={state.values.name} autoComplete="off" />

      <label htmlFor="town-slug">Web address</label>
      <div className={styles.slugField}>
        <span>/t/</span>
        <input
          id="town-slug"
          name="slug"
          placeholder="maple-street"
          defaultValue={state.values.slug}
          autoComplete="off"
          aria-describedby="town-slug-hint"
        />
      </div>
      <p id="town-slug-hint" className={styles.hint}>
        Lowercase letters, numbers and single hyphens. Leave blank to generate one from the name.
      </p>

      {state.error ? (
        <p className={styles.formError} role="alert">
          {state.error}
        </p>
      ) : null}

      <button className="button button--primary" type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create draft town"}
      </button>
    </form>
  );
}
