/**
 * Always positive modulus
 * @param x Operand
 * @param n Modulus
 * @returns x modulo n
 */
export function mod(x: number, n: number): number {
  return (x % n + n) % n;
}

export function clamp(val: number, min = 0, max = 1): number {
  if (val < min) return min;
  if (val > max) return max;
  return val;
}

export function capitalize(string: string) {
	return string.charAt(0).toUpperCase() + string.substring(1);
}

interface HasMap {
	map: {[key:string]: string};
}

/**
 * Format a string in a flexible way. Scans for %s strings and replaces them with arguments. List of patterns is modifiable via Util.format.map.
 * @param {string} template
 * @param {any} [argv]
 */
export function format(template: string, ...args: unknown[]): string {
	// The function property is public formatting configuration.
	const map = (format as unknown as HasMap).map;

	const replacer = function(match: string, group1: string, group2: string, index: number): string {
		if (template.charAt(index-1) === "%") { return match.substring(1); }
		if (!args.length) { return match; }
		let obj: unknown = args[0];

		const group = group1 || group2;
		const parts = group.split(",");
		const name = parts.shift() || "";
		const method = map[name.toLowerCase()];
		if (!method) { return match; }

		obj = args.shift();
		const target = Object(obj);
		const methodValue = Reflect.get(target, method);
		if (typeof methodValue !== "function") { return match; }
		let replaced: unknown = Reflect.apply(methodValue, target, parts);
		replaced = typeof replaced === "string" ? replaced : String(replaced);

		const first = name.charAt(0);
		const replacedText = typeof replaced === "string" ? replaced : String(replaced);
		return first !== first.toLowerCase() ? capitalize(replacedText) : replacedText;
	};
	return template.replace(/%(?:([a-z]+)|(?:{([^}]+)}))/gi, replacer);
}

(format as unknown as HasMap).map = {
	"s": "toString"
}
