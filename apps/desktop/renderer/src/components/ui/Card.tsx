import type { ReactNode } from 'react';

type CardProps = {
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
};

export function Card({ title, description, className = '', children }: CardProps) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || description) && (
        <header className="card__header">
          {title ? <h3 className="card__title">{title}</h3> : null}
          {description ? <p className="card__description">{description}</p> : null}
        </header>
      )}
      <div className="card__body">{children}</div>
    </section>
  );
}
