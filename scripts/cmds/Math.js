module.exports = {
 config: {
   name: "math",
   version: "1.0.0",
   author: "Siam the frog>🐸",
   countDown: 0,
   role: 0,
   shortDescription: "math",
   longDescription: "math",
   category: "math",
 },
  onStart: async function ({ api, event, args }) {
    const calculator = (frog) => {
      try {
        return eval(frog);
      } catch (error) {
        return "Error: Bakobasi ban kar behenchod";
      }
      };
    const frog = args.join(" ");
    const result = calculator(frog);
    api.sendMessage(`Result :\n${frog} = ${result}`, event.threadID);
  }
}; 
