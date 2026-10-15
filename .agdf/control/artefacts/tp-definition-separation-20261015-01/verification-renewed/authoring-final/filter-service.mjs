export class FilterService {
  #users = new Map();
  save(user, name, values) {
    if (!user || !name || !values || typeof values !== 'object' || Array.isArray(values)) throw new TypeError('Invalid saved-filter input');
    if (!this.#users.has(user)) this.#users.set(user, new Map());
    this.#users.get(user).set(name, structuredClone(values));
  }
  restore(user, name) {
    const values = this.#users.get(user)?.get(name);
    if (!values) throw new RangeError('Saved filter unavailable for this user');
    return structuredClone(values);
  }
}
