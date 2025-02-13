import { LinksFooter } from '@/app/(landing-page)/client-page/components/links-footer';
import { CONFIG } from '@/config';
import { generateMetadata } from '@/utils/metadata';
import { Anchor, Container, Stack, Text, Title } from '@mantine/core';
import NextLink from 'next/link';

export const metadata = generateMetadata();

export default function TermsAndConditions() {
  return (
    <>
      <Container size="lg" py="xl">
        <Stack gap="xl">
          {/* Main Header */}
          <Title order={1}>Terms &amp; Conditions</Title>
          <Text fw={500}>Last updated: February 7th, 2025</Text>

          {/* Introduction */}
          <Text>
            These Terms and Conditions ("Terms", "Terms and Conditions") govern your relationship
            with{' '}
            <Anchor component={NextLink} href={CONFIG.site.url}>
              {CONFIG.site.url}
            </Anchor>{' '}
            (the "Service") operated by MagicRedact ("us", "we", or "our").
          </Text>
          <Text>
            Please read these Terms and Conditions carefully before using the Service. Your access
            to and use of the Service is conditioned on your acceptance of and compliance with these
            Terms. These Terms apply to all visitors, users, and others who access or use the
            Service.
          </Text>
          <Text>
            By accessing or using the Service, you agree to be bound by these Terms. If you disagree
            with any part of the Terms, then you may not access the Service.
          </Text>

          {/* Subscriptions */}
          <Title order={2}>Subscriptions</Title>
          <Text>
            Certain parts of the Service are billed on a subscription basis ("Subscription(s)"). You
            will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing
            cycles are set either on a monthly or annual basis, depending on the subscription plan
            you select when purchasing a Subscription.
          </Text>
          <Text>
            At the end of each Billing Cycle, your Subscription will automatically renew under the
            same conditions unless you cancel it or MagicRedact cancels it. You may cancel your
            Subscription renewal either through your online account management page or by contacting
            our customer support team.
          </Text>
          <Text>
            A valid payment method, including credit card or PayPal, must be provided to process the
            payment for your Subscription. You shall provide MagicRedact with complete billing
            information, including your full name, address, telephone number, and valid payment
            method details. By providing such information, you authorize us to charge all
            Subscription fees incurred through your account.
          </Text>
          <Text>
            If automatic billing fails for any reason, MagicRedact will issue an electronic invoice
            indicating that you must proceed manually, within a specified deadline, with full
            payment corresponding to the billing period.
          </Text>

          {/* Fee Changes */}
          <Title order={2}>Fee Changes</Title>
          <Text>
            MagicRedact may modify the Subscription fees at its sole discretion and at any time. Any
            fee change will become effective at the end of the current Billing Cycle.
          </Text>
          <Text>
            You will be provided with reasonable prior notice of any change in Subscription fees,
            giving you an opportunity to cancel your Subscription before the change takes effect.
            Your continued use of the Service after the fee change implies acceptance of the new
            fee.
          </Text>

          {/* Refunds */}
          <Title order={2}>Refunds</Title>
          <Text>
            Certain refund requests for Subscriptions may be considered on a case-by-case basis and
            may be granted at the sole discretion of MagicRedact
          </Text>

          {/* Content */}
          <Title order={2}>Content</Title>
          <Text>
            Our Service allows you to post, link, store, share, and otherwise make available certain
            information, text, graphics, videos, or other material ("Content"). You are responsible
            for the Content that you post on the Service, including its legality, reliability, and
            appropriateness.
          </Text>
          <Text>
            By posting Content to the Service, you grant us a non-exclusive, transferable,
            sublicensable, royalty-free, and worldwide license to use, modify, perform, display,
            reproduce, and distribute such Content on and through the Service. You retain all your
            rights to any Content you submit, post, or display on the Service and are responsible
            for protecting those rights.
          </Text>
          <Text>
            You represent that you either own the Content you submit or have the necessary licenses,
            rights, or permissions to use and share it.
          </Text>

          {/* Accounts */}
          <Title order={2}>Accounts</Title>
          <Text>
            When you create an account with us, you must provide information that is accurate,
            complete, and current at all times. Failure to do so constitutes a breach of these Terms
            and may result in immediate termination of your account.
          </Text>
          <Text>
            You are responsible for safeguarding the password that you use to access the Service and
            for any activities or actions under your account. You agree not to disclose your
            password to any third party and to notify us immediately of any breach of security or
            unauthorized use of your account.
          </Text>

          {/* Intellectual Property */}
          <Title order={2}>Intellectual Property</Title>
          <Text>
            The Service and its original content (excluding user-provided Content), features, and
            functionality are and will remain the exclusive property of MagicRedact and its
            licensors. The Service is protected by copyright, trademark, and other laws. Its design,
            layout, and other proprietary materials may not be used without prior written consent
            from MagicRedact
          </Text>

          {/* Links To Other Web Sites */}
          <Title order={2}>Links To Other Web Sites</Title>
          <Text>
            The Service may contain links to third-party websites or services that are not owned or
            controlled by MagicRedact We have no control over, and assume no responsibility for, the
            content or practices of these third-party websites or services. You acknowledge that
            MagicRedact is not liable for any harm or damages related to the use of such websites or
            services.
          </Text>
          <Text>
            We strongly advise you to review the terms and conditions and privacy policies of any
            third-party sites you visit.
          </Text>

          {/* Termination */}
          <Title order={2}>Termination</Title>
          <Text>
            We may terminate or suspend your account immediately, without prior notice or liability,
            if you breach these Terms. Upon termination, your right to use the Service will
            immediately cease. If you wish to terminate your account, you may simply discontinue
            using the Service.
          </Text>

          {/* Limitation Of Liability */}
          <Title order={2}>Limitation Of Liability</Title>
          <Text>
            In no event shall MagicRedact , nor its directors, employees, partners, agents,
            suppliers, or affiliates, be liable for any indirect, incidental, special,
            consequential, or punitive damages (including, without limitation, loss of profits,
            data, use, goodwill, or other intangible losses) arising out of your access to or use
            of, or inability to access or use, the Service; any conduct or content of any third
            party on the Service; any content obtained from the Service; or unauthorized access,
            use, or alteration of your transmissions or content.
          </Text>
          <Text>
            This limitation applies regardless of the legal theory on which any claim is based, even
            if MagicRedact has been advised of the possibility of such damages.
          </Text>

          {/* Disclaimer */}
          <Title order={2}>Disclaimer</Title>
          <Text>
            Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and
            "AS AVAILABLE" basis, without warranties of any kind, whether express or implied,
            including but not limited to warranties of merchantability, fitness for a particular
            purpose, non-infringement, or performance.
          </Text>
          <Text>
            MagicRedact does not guarantee that the Service will operate uninterrupted, be
            error-free, or meet your requirements.{' '}
            <strong>
              Note that MagicRedact is not HIPAA compliant and should not be used for processing
              HIPAA-protected information.
            </strong>
          </Text>

          {/* Governing Law */}
          <Title order={2}>Governing Law</Title>
          <Text>
            These Terms shall be governed by and construed in accordance with the laws of New York,
            United States, without regard to its conflict of law principles. If any provision of
            these Terms is found to be invalid or unenforceable by a court, the remaining provisions
            will remain in full effect. These Terms constitute the entire agreement between you and
            MagicRedact regarding your use of the Service.
          </Text>

          {/* Changes */}
          <Title order={2}>Changes</Title>
          <Text>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any
            time. If a revision is material, we will provide you with at least 30 days' notice
            before the new terms take effect. Your continued use of the Service after those
            revisions indicates your acceptance of the new terms. If you do not agree to the new
            terms, please stop using the Service.
          </Text>

          {/* Contact Us */}
          <Title order={2}>Contact Us</Title>
          <Text>
            If you have any questions about these Terms, please contact us at{' '}
            <Anchor component={NextLink} href={`mailto:${CONFIG.support.email}`}>
              {CONFIG.support.email}
            </Anchor>
          </Text>
        </Stack>
      </Container>
      <LinksFooter />
    </>
  );
}
