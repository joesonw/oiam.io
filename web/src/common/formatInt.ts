const re = /^[0-9\b]+$/;

export default function formatInt(input: string, original: string) {
    if (input === '' || re.test(input)) {
        return input;
    }
    return original;
}
