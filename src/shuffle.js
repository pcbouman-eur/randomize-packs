export default function shuffle(arr) {
    const result = [...arr];
    for (let i=arr.length; i > 1; i--) {
        const fromIndex = Math.floor(Math.random() * i);
        const toIndex = i-1;
        const temp = result[toIndex];
        result[fromIndex] = result[toIndex];
        result[toIndex] = temp;
    }
    return result;
}