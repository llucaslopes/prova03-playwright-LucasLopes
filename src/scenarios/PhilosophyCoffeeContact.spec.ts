import { test, expect } from '@playwright/test';
import { ai } from '@zerostep/playwright';
import { join } from 'path';
import { TheConfig } from 'sicolo';
import { faker } from '@faker-js/faker';
import PhilosophyCoffeeContactPage from '../support/pages/PhilosophyCoffeeContactPage';

test.describe('Philosophy Coffee - Formulário de Contato', () => {
  const CONFIG = join(__dirname, '../support/fixtures/config.yml');
  let pageObject: PhilosophyCoffeeContactPage;
  const BASE_URL = TheConfig.fromFile(CONFIG)
    .andPath('application.philosophyCoffee')
    .retrieveData();

  test.beforeEach(async ({ page }) => {
    pageObject = new PhilosophyCoffeeContactPage(page);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await pageObject.elements.getNameField().waitFor({ timeout: 15000 });
  });

  test('CT001 - Envio completo do formulário', async () => {
    const nome = faker.person.fullName();
    const email = faker.internet.email();
    const assunto = 'Pergunta sobre produtos';
    const mensagem = faker.lorem.paragraph();

    await pageObject.preencherTodosCampos(nome, email, assunto, mensagem);
    await pageObject.enviarFormulario();
    await pageObject.validarSucesso();
  });

  test('CT002 - Verificar campos obrigatórios', async () => {
    await pageObject.enviarFormulario();
    await pageObject.validarObrigatorio('name');
    await pageObject.validarObrigatorio('email');

    const nome = faker.person.fullName();
    await pageObject.elements.getNameField().fill(nome);
    await pageObject.enviarFormulario();

    await pageObject.validarObrigatorio('email');
  });

  test('CT003 - Uso do ZeroStep AI', async ({ page }) => {
    if (!process.env.ZEROSTEP_TOKEN) test.skip();

    const nome = faker.person.fullName();
    const email = faker.internet.email();
    const mensagem = 'Gostaria de obter mais informações sobre blends especiais.';

    await ai(
      `Preencha o formulário de contato com:
       Nome: ${nome}
       Email: ${email}
       Mensagem: ${mensagem}
       Clique em enviar`,
      { page, test }
    );

    await pageObject.validarSucesso();
  });
});
