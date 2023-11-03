export function joinClasses(...classes: string[]): string {
    return classes.filter((c) => c).join(" ");
}