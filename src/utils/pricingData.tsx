export const pricingData = [
  {
    title: 'Personal',
    isPopular: true,
    skuDataId: 'ws_personal',

    description:
      'Easy digital signing for individuals to send, track, and manage documents securely from anywhere online.',
    features: [
      {
        name: 'Single user/license',
        tooltipText:
          "Personal is a single user plan. If you're looking to purchase up to 10 users/license, you can do so online by selecting a Business or Enterprise Plan.",
      },
      {
        name: 'Send 100 documents per month',
        tooltipText:
          'Send documents to others for them to sign and fill out. One send can include any number of recipients and any number of documents.',
      },
      {
        name: 'Single Channel Email Delivery',
        tooltipText:
          'Send instant agreement notifications directly to signers’ email inboxes for quick and reliable access.',
      },
      {
        name: 'Real-time tracking and notifications ',
        tooltipText:
          'Track every document at a glance with real-time alerts for opens, views, and signatures.',
      },

      {
        name: 'Envelope Ordering',
        link: 'https://wesign.com/articles/envelope-ordering.html',

        tooltipText:
          'Control the signing flow by ensuring documents appear in sequence — each becomes accessible only after the previous one is completed.',
      },
      {
        name: 'Basic & Pre-filled fields',
        link: 'https://wesign.com/articles/prefilled-in-wesign.html',
        tooltipText:
          'Speed up document creation by adding ready-made fields and auto-filled details to reduce mistakes and improve accuracy.',
      },
      {
        name: 'Access Code',
        tooltipText:
          'Add an extra layer of protection by sending a secure access code that must be entered before viewing the document.',
      },
      {
        name: 'Reminders & Private Messaging',
        link: 'https://wesign.com/articles/reminders-and-private-messaging.html',
        tooltipText:
          'Automatically nudge signers to complete documents on time while sending personalized messages when needed.',
      },
      {
        name: 'Mobile Signing ',
        tooltipText:
          'Documents automatically adjust to any mobile screen, making signing easy and smooth on phones or tablets.',
      },

      {
        name: '24/7 email and chat support',
        tooltipText: 'Get the support you need via email & chat',
      },
    ],
    webFeatures: [
      {
        name: 'Power Form',
        link: 'https://wesign.com/articles/power-form-in-wesign.html',
        tooltipText:
          'Publish a self-serve signable form on your website or simply share a URL so recipients can fill and sign anytime.',
      },
      {
        name: 'Unlimited Templates',
        link: 'https://wesign.com/articles/templates-in-electronic-signature-applications.html',
        tooltipText:
          'Create standardized templates for recurring documents to save time and ensure consistency across your workflow.',
      },
    ],
  },
  {
    title: 'Business',
    isPopular: false,
    skuDataId: 'ws_business',

    description:
      'Powerful eSignature platform for growing teams with branding, payment collection, multichannel delivery, and advanced collaboration features.',
    features: [
      {name: 'All Personal benefits'},
      {
        name: '10 users/license',
        tooltipText:
          "Business is 10 user plan. If you're looking to purchase up to 30 users/license, you can do so online by selecting Enterprise Plan.",
      },
      {
        name: 'Send 200 documents per month',
        tooltipText:
          'Send documents to others for them to sign and fill out. One send can include any number of recipients and any number of documents.',
      },
      {
        name: 'Request Payment and Signature in one go',
        tooltipText: 'Collect Signatures & Payments in One go.',
      },
      {
        name: "Verify the recipient's identity before signing",
        tooltipText:
          'Use a password OTP to verify signers and prevent unauthorized access to documents.',
      },
      {
        name: 'Multichannel Delivery (Email and SMS)',
        link: 'https://wesign.com/articles/sending-envelope-via-sms.html',

        tooltipText:
          'Reach signers instantly through both Email and SMS, improving response rates and offering flexibility in communication.',
      },
      {
        name: 'In-Person Signing',
        link: 'https://wesign.com/articles/wesigndoc-in-person-signer-blog.html',
        tooltipText:
          'Collect handwritten e-signatures face-to-face on any PC or mobile device, even when the signer has no email or phone.',
      },
      {
        name: 'Customized Branding',
        tooltipText:
          'Enhance trust by adding your logo, brand colors, and custom messages to every signing experience.',
      },
    ],
    webFeatures: [
      {
        name: 'Bulk Send ',
        link: 'https://wesign.com/articles/bulk-send-in-wesign.html',
        tooltipText:
          'Send personalized signature requests to hundreds of recipients at once — all with one simple action.',
      },
      {
        name: 'Scheduled Sending',
        link: 'https://wesign.com/articles/schedule-envelope.html',
        tooltipText:
          'Send personalized signature requests to hundreds of recipients at once — allwith one simple action.',
      },
      {
        name: 'Sub-user Limited Admin Access',
        link: 'https://wesign.com/articles/make-sub-user-an-admin.html',
        tooltipText:
          'Promote a user to a limited admin role so they can assist with essential tasks while maintaining controlled permissions.',
      },
    ],
  },
  {
    title: 'Enterprise',
    isPopular: false,
    skuDataId: 'ws_enterprise',

    description:
      'Scalable enterprise platform with API integrations, advanced security, permissions, and high-volume document workflow management capabilities.',
    features: [
      {name: 'All Business benefits'},
      {
        name: '30 users/license',
        tooltipText:
          "Enterprise is 30 user plan. If you're looking to purchase more than 30 users/license, kindly contact to our support team.",
      },
      {
        name: 'Send 800 documents per month',
        tooltipText:
          'Send documents to others for them to sign and fill out. One send can include any number of recipients and any number of documents.',
      },
    ],
    webFeatures: [
      {
        name: 'Api & SDK Integration',
        link: 'https://wesign.com/articles/esignature-api-integration.html',
        tooltipText:
          'Integrate WesignDoc into your website or app using powerful APIs to create, manage, and sign documents directly within your own system.',
      },
      {
        name: 'IAM',
        link: 'https://wesign.com/articles/iam-in-wesign.html',
        tooltipText:
          'Define exactly which signer can view which document — ideal for multi-recipient workflows where privacy and control are critical.',
      },
      {
        name: 'Web Form',
        link: 'https://wesign.com/articles/how-to-build-a-web-form.html',
        tooltipText:
          'Web Forms are digital forms that allow users to enter information and sign documents online through a simple, interactive interface.',
      },
    ],
  },
];
