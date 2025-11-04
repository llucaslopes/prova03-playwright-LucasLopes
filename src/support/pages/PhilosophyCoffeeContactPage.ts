import { Page, expect } from '@playwright/test';
import PhilosophyCoffeeContactElements from '../elements/PhilosophyCoffeeContactElements';
import BasePage from './BasePage';

export default class PhilosophyCoffeeContactPage extends BasePage {
  readonly elements: PhilosophyCoffeeContactElements;

  constructor(page: Page) {
    super(page);
    this.elements = new PhilosophyCoffeeContactElements(page);
  }

  async preencherTodosCampos(
    nome: string,
    email: string,
    assunto: string,
    mensagem: string
  ) {
    await this.elements.getNameField().fill(nome);
    await this.elements.getEmailField().fill(email);
    await this.elements.getSubjectField().fill(assunto);
    await this.elements.getMessageField().fill(mensagem);
  }

  async enviarFormulario() {
    const botao = this.elements.getSendButton();
    await botao.scrollIntoViewIfNeeded();
    await botao.click({ force: true });
  }

  async validarSucesso() {
    await this.page.waitForTimeout(2000);
    await expect(this.elements.getSendButton()).toBeVisible();

    const erros = this.page.locator('[class*="error"], [class*="Error"]');
    expect(await erros.count()).toBe(0);
  }

  async validarObrigatorio(campo: 'name' | 'email') {
    const input = campo === 'name' ? this.elements.getNameField() : this.elements.getEmailField();

    const invalido = await input.evaluate((el: HTMLInputElement) => {
      return el.validity.valueMissing || !el.checkValidity() || el.getAttribute('aria-invalid') === 'true';
    });

    expect(invalido).toBeTruthy();
  }
}
