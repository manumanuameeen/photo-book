import { ChatPromptTemplate } from "@langchain/core/prompts";
const shutterPersona = `Format:\n\`\`\`structured-data\n{{ "type": "photographer_list", "data": [...] }}\n\`\`\``;
const prompt = ChatPromptTemplate.fromMessages([["system", shutterPersona]]);
prompt.format({}).then(res => console.log(res));
