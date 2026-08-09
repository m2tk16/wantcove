const contactEmail = 'wantcove@gmail.com'

export function ContactPage() {
  return <article className="contact-page">
    <header>
      <span className="kicker">Support</span>
      <h1>Contact WantCove</h1>
      <p>Questions about WantCove, a product listing, or your privacy? Email the monitored WantCove inbox.</p>
      <a className="button" href={`mailto:${contactEmail}`}>Email {contactEmail}</a>
    </header>
    <div className="contact-content">
      <section>
        <h2>Before you send</h2>
        <p>Do not email passwords, authentication codes, payment details, tax information, government identifiers, or other sensitive information. WantCove will never ask you to send a password or multifactor-authentication code.</p>
      </section>
      <section>
        <h2>Email and privacy</h2>
        <p>The email link opens your device&apos;s email application or provider. WantCove does not operate a website contact form and does not store your message in its GraphQL or DynamoDB catalog systems. Your email provider and Google, which hosts the WantCove mailbox, process the message and its delivery metadata under their own terms and privacy policies.</p>
      </section>
      <section>
        <h2>Privacy requests</h2>
        <p>You can use this address for privacy questions or requests. Include enough detail for WantCove to understand the request, but do not include unnecessary sensitive information.</p>
      </section>
    </div>
  </article>
}
