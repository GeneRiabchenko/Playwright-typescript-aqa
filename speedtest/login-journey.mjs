// login-journey.mjs
export default async function (context, commands) {
  await commands.navigate('https://example.com/login');

  await commands.addText.byId('my-user', 'username');
  await commands.addText.byId('my-password', 'password');

  await commands.measure.start('dashboard_after_login');
  await commands.click.byIdAndWait('login-button');
  await commands.measure.stop();

  await commands.measure.start('https://example.com/contacts');
}