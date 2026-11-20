import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { submitContactForm } from '../../services/contact.service';

export interface SendContactFormResult {
  message: string;
  data: {
    sent: boolean;
    id?: string;
  };
}

export const sendContactForm = defineAction({
  input: z.object({
    fullName: z.string().trim().min(1, 'El nombre completo es requerido'),
    company: z.string().trim().min(1, 'La empresa es requerida'),
    email: z.string().trim().email('Correo electrónico inválido'),
    phone: z.string().trim().min(1, 'El teléfono es requerido'),
    message: z.string().trim().optional(),
  }),
  handler: async (input): Promise<SendContactFormResult> => {
    try {
      const result = await submitContactForm({
        name: input.fullName,
        company: input.company,
        email_address: input.email,
        phone: input.phone,
        message: input.message,
      });

      return {
        message: result.message || 'Formulario de contacto enviado con éxito',
        data: {
          sent: true,
          id: result.data?.id,
        },
      };
    } catch (error) {
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Error al enviar el formulario de contacto',
      });
    }
  },
});
