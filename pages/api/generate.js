import { Configuration, OpenAIApi } from "openai";
import { z } from "zod";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const input = req.body || "";
  console.log("input", input);
  if (input.companyName.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter your company name",
      },
    });
    return;
  }
  if (input.characteristics.length === 0) {
    res.status(400).json({
      error: {
        message: "Please provide at least one characteristic",
      },
    });
    return;
  }
  if (input.space.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please provide a space",
      },
    });
    return;
  }

  try {
    const designSystemName = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generateDesignSystemName(input),
      temperature: 0.5,
      max_tokens: 2048,
    });

    const designSystemNameAndDescription = JSON.parse(
      designSystemName.data.choices[0].text
    );

    console.log(
      "designSystemNameAndDescription",
      designSystemNameAndDescription
    );

    const designSystemTokens = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generateDesignSystem(
        designSystemNameAndDescription.designSystemName,
        input
      ),
      temperature: 0.5,
      max_tokens: 2048,
    });

    const designSystem = {
      name: designSystemNameAndDescription.designSystemName,
      description: designSystemNameAndDescription.designSystemDescription,
      tokens: JSON.parse(designSystemTokens.data.choices[0].text),
    };

    res.status(200).json({ result: designSystem });
  } catch (error) {
    console.log("error", error);
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generateDesignSystemName(input) {
  const capitalizedCompanyName =
    input.companyName.charAt(0).toUpperCase() + input.companyName.slice(1);

  return `suggest me a modern, cohesive design system name in one word, and a description explaining the choice of this name for ${capitalizedCompanyName} that is ${input.characteristics.join(
    ","
  )}. The design system name should be suitable for use in ${
    input.space
  } and return this generated name along with the description as a JSON having two parameters one is called designSystemName and the other called designSystemDescription.`;
}

function generateDesignSystem(name, input) {
  return `Can you give me a design system (color and font only) based on the name ${name} for the company ${input.companyName} and return it as JSON?`;
}
