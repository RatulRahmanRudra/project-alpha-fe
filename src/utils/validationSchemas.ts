import * as Yup from 'yup';

export const generateValidationSchema = (questions: any[]) => {
  const schemaFields: Record<string, any> = {};

  questions.forEach((question) => {
    if (question.required) {
      switch (question.type) {
        case 'text':
          schemaFields[question.id] = Yup.string().required(`${question.title} is required`);
          break;
        case 'select':
          schemaFields[question.id] = Yup.string().required(`${question.title} is required`);
          break;
        case 'multiselect':
          schemaFields[question.id] = Yup.array().min(1, `Please select at least one option for ${question.title}`);
          break;
        case 'slider':
          schemaFields[question.id] = Yup.number().required(`${question.title} is required`);
          break;
      }
    }
  });

  return Yup.object().shape(schemaFields);
};