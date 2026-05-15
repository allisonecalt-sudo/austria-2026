// Linkification helpers.
// Per Allison's "link it" feedback (2026-05-15): every place / phone / address
// becomes a tap target. Phone → tel:, WhatsApp → wa.me, addresses → Google Maps,
// directions → Google Maps directions, attractions → official site if known else Maps.
//
// Fail-loud rule: if a destination can't be verified (we'd be guessing), the
// caller should just return plain text instead of calling these.

export function mapsLink(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function directionsLink(origin: string, destination: string): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    origin,
  )}&destination=${encodeURIComponent(destination)}`;
}

export function telLink(phone: string): string {
  // Strip everything but digits and leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  return `tel:${cleaned}`;
}

export function waLink(phone: string): string {
  // wa.me wants digits only, no +
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}`;
}

export function mailLink(email: string): string {
  return `mailto:${email}`;
}

// Render an `<a>` to a Google Maps search for a place name.
export function placeAnchor(name: string, displayText?: string): string {
  return `<a href="${mapsLink(name)}" target="_blank" rel="noreferrer noopener">${
    displayText ?? name
  }</a>`;
}
