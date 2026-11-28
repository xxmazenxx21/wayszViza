/**
 * WaysZ Visa forms — frontend only (no backend of our own).
 *
 * Markup contract (every form):
 *   <form data-form="contact" data-messages={JSON.stringify(t.form)} novalidate>
 *     <input id="contact-name" name="name" required aria-describedby="contact-name-error">
 *     <p id="contact-name-error" class="field__error" aria-live="polite"></p>
 *     …
 *     <button type="submit">…</button>
 *     <p data-form-status role="status"></p>
 *   </form>
 *
 * Extras:
 *   data-msg="<key of t.form>" on a field   → its message when it is empty or invalid (e.g. "residence"); without it,
 *                                              selects say t.form.service and other fields t.form.required (email and
 *                                              phone fields always say t.form.email / t.form.phone when malformed).
 *   radio / checkbox groups                  → the error lives under the FIRST input of the group (`<id>-error`) and
 *                                              clears as soon as any input of the group makes it valid.
 *   data-param="<name>" on a field           → prefilled from the URL (?<name>=…) when the value is valid for that
 *                                              field: an existing option / radio / checkbox value (checkboxes take a
 *                                              comma list or repeated params), a number inside min…max, a YYYY-MM
 *                                              month, short text. Anything else is ignored. Prefilled fields get
 *                                              `data-prefilled` on their `.field` wrapper.
 *
 * Events dispatched on the <form> (the form-flight motion scene listens to them):
 *   'waysz:form-prefill' (detail.params: the URLSearchParams, after the data-param fields are filled)
 *   'waysz:form-success'  ·  'waysz:form-error' (detail.reason: 'validation' | 'network')
 */

type FormMessages = Record<string, string> & {
  required: string; phone: string; email: string; service: string;
  success: string; error: string; sending: string;
};
type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const ENDPOINT = (import.meta.env.PUBLIC_FORM_ENDPOINT as string | undefined) ?? '';

/**
 * The ONLY place that knows where messages go.
 * TODO(endpoint): the destination is not decided yet (target mailbox to be confirmed by the client).
 * Until PUBLIC_FORM_ENDPOINT is set, sending is simulated.
 * Do not pick a provider without the team's decision.
 */
async function send(formName: string, data: FormData): Promise<void> {
  if (!ENDPOINT) {
    const shown: Record<string, string> = {};
    for (const [k, v] of data) shown[k] = k in shown ? `${shown[k]}, ${v}` : String(v);   // multi-value fields (services)
    console.info(`[forms] simulated send → "${formName}"`, shown);
    await new Promise((resolve) => setTimeout(resolve, 700));
    return;
  }
  data.append('form', formName);
  const res = await fetch(ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Form endpoint answered ${res.status}`);
}

const isGroup = (f: Field): f is HTMLInputElement => f instanceof HTMLInputElement && (f.type === 'radio' || f.type === 'checkbox');

/** The input that carries a field's error: itself, or the first input of its radio / checkbox group. */
function anchorOf(field: Field): Field {
  if (!isGroup(field) || !field.form) return field;
  return field.form.querySelector<HTMLInputElement>(`input[name="${CSS.escape(field.name)}"]`) ?? field;
}

function messageFor(field: Field, msgs: FormMessages): string {
  const v = field.validity;
  const own = anchorOf(field).dataset.msg;
  if (v.valueMissing) return (own && msgs[own]) || (field instanceof HTMLSelectElement ? msgs.service : msgs.required);
  if (field.type === 'email') return msgs.email;
  if (field.type === 'tel') return msgs.phone;
  return (own && msgs[own]) || msgs.required;
}

function setError(field: Field, text: string) {
  const anchor = anchorOf(field);
  const group = isGroup(field) && field.form
    ? [...field.form.querySelectorAll<HTMLInputElement>(`input[name="${CSS.escape(field.name)}"]`)]
    : [field];
  for (const f of group) {
    if (text) f.setAttribute('aria-invalid', 'true');
    else f.removeAttribute('aria-invalid');
  }
  const out = document.getElementById(`${anchor.id}-error`);
  if (out) out.textContent = text;
}

/** ?<data-param>=… → the field, only when the value is valid for it. */
function prefill(form: HTMLFormElement, params: URLSearchParams) {
  const mark = (el: Element) => el.closest('.field')?.setAttribute('data-prefilled', '');
  const done = new Set<string>();
  form.querySelectorAll<Field>('[data-param]').forEach((field) => {
    const key = field.dataset.param!;
    const values = params.getAll(key).flatMap((v) => v.split(',')).map((v) => v.trim()).filter(Boolean);
    if (!values.length) return;
    if (isGroup(field)) {
      if (done.has(field.name)) return;
      done.add(field.name);
      const inputs = [...form.querySelectorAll<HTMLInputElement>(`input[name="${CSS.escape(field.name)}"]`)];
      const wanted = field.type === 'radio' ? values.slice(0, 1) : values;
      for (const input of inputs) if (wanted.includes(input.value)) { input.checked = true; mark(input); }
      return;
    }
    const v = values[0];
    if (field instanceof HTMLSelectElement) {
      const match = [...field.options].find((o) => o.value && (o.value === v || o.value === v.toUpperCase()));
      if (match) { field.value = match.value; mark(field); }
    } else if (field instanceof HTMLInputElement && field.type === 'number') {
      const n = Number(v);
      const min = field.min ? Number(field.min) : -Infinity;
      const max = field.max ? Number(field.max) : Infinity;
      if (Number.isInteger(n) && n >= min && n <= max) { field.value = String(n); mark(field); }
    } else if (field.type === 'month') {
      if (/^\d{4}-(0[1-9]|1[0-2])$/.test(v)) { field.value = v; mark(field); }
    } else if (v.length <= 200) {
      field.value = v; mark(field);
    }
  });
  form.dispatchEvent(new CustomEvent('waysz:form-prefill', { detail: { params } }));
}

export function initForms() {
  document.querySelectorAll<HTMLFormElement>('form[data-form]').forEach((form) => {
    const msgs = JSON.parse(form.dataset.messages || '{}') as FormMessages;
    const status = form.querySelector<HTMLElement>('[data-form-status]');
    const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
    const fields = () =>
      [...form.elements].filter((el): el is Field => 'validity' in el && (el as Field).willValidate);

    form.noValidate = true;
    prefill(form, new URLSearchParams(location.search));
    form.dataset.ready = '';   // page scripts that run later check this instead of waiting for 'waysz:form-prefill'

    // Clear a field's (or a group's) error as soon as it becomes valid
    const clear = (e: Event) => {
      const f = e.target as Field;
      if (anchorOf(f)?.getAttribute?.('aria-invalid') === 'true' && f.checkValidity()) setError(f, '');
    };
    form.addEventListener('input', clear);
    form.addEventListener('change', clear);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let firstInvalid: Field | null = null;
      const seen = new Set<Field>();
      for (const f of fields()) {
        const anchor = anchorOf(f);
        if (seen.has(anchor)) continue;   // one message per radio / checkbox group
        seen.add(anchor);
        if (f.checkValidity()) setError(f, '');
        else { setError(f, messageFor(f, msgs)); firstInvalid ??= anchor; }
      }
      if (firstInvalid) {
        firstInvalid.focus();
        form.dispatchEvent(new CustomEvent('waysz:form-error', { detail: { reason: 'validation' } }));
        return;
      }

      const label = submit?.textContent ?? '';
      if (submit) { submit.disabled = true; submit.textContent = msgs.sending; }
      if (status) { status.textContent = ''; delete status.dataset.state; }
      try {
        await send(form.dataset.form!, new FormData(form));
        if (status) { status.textContent = msgs.success; status.dataset.state = 'success'; }
        form.reset();
        form.querySelectorAll('[data-prefilled]').forEach((el) => el.removeAttribute('data-prefilled'));
        form.dispatchEvent(new CustomEvent('waysz:form-success'));
      } catch (err) {
        // everything the visitor typed stays in the form
        console.error('[forms]', err);
        if (status) { status.textContent = msgs.error; status.dataset.state = 'error'; }
        form.dispatchEvent(new CustomEvent('waysz:form-error', { detail: { reason: 'network' } }));
      } finally {
        if (submit) { submit.disabled = false; submit.textContent = label; }
      }
    });
  });
}
