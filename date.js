// console.log(module);

export function getdate() {
    const today = new Date();
    const currentday = today.getDay();

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    return  today.toLocaleDateString("en-us", options);
    
}

// export function jmd(a, b) {
//     return a + b;
// }
// export { getdate };