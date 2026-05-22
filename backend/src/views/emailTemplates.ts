export function auditConfirmationHtml(params: {
  monthlySavings: number;
  annualSavings: number;
  auditState: string;
  shareUrl?: string;
}) {
  const high = params.auditState === "high_savings";
  return `
    <p>Thanks for running a Stackwise audit.</p>
    <p><strong>Estimated savings:</strong> $${params.monthlySavings}/mo (~$${params.annualSavings}/yr)</p>
    ${
      params.shareUrl
        ? `<p><a href="${params.shareUrl}">View your public audit link</a> (no email or company name on this page).</p>`
        : ""
    }
    ${
      high
        ? `<p>Because your audit shows significant savings, someone from <strong>Credex</strong> may reach out within 1 business day about discounted AI infrastructure credits.</p>`
        : `<p>Your stack looks reasonably tight. We'll only email when a new optimization applies to tools like yours.</p>`
    }
    <p style="color:#666;font-size:12px">Stackwise · Built by Credex · <a href="https://credex.rocks">credex.rocks</a></p>
  `;
}
