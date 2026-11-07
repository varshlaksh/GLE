export const BUSINESS_DETAILS = {
  supportEmail: "theganagallery@gmail.com",
  supportPhones: [
    { display: "+91 6399937135", href: "tel:+916399937135" },
    { display: "+91 9897965454", href: "tel:+919897965454" },
  ],
  address: "Rithani, Meerut, Uttar Pradesh, India",
  whatsappNumber: "919897965454",
} as const;

export function getWhatsAppUrl(message: string) {
  return `https://wa.me/${BUSINESS_DETAILS.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
