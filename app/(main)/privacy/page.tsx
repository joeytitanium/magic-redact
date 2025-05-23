import { LinksFooter } from '@/components/editor/components/links-footer';
import { CONFIG } from '@/config';
import { generateMetadata } from '@/utils/metadata';
import { Anchor, Container, List, ListItem, Paper, Stack, Text, Title } from '@mantine/core';
import NextLink from 'next/link';

export const metadata = generateMetadata();

export default function PrivacyPolicy() {
  return (
    <>
      <Container size="lg" py="xl">
        <Stack gap="xl">
          <Title order={1}>Privacy Policy</Title>
          <Text fw={500}>Last updated: February 7th, 2025</Text>
          <Paper withBorder p="md" shadow="sm">
            <Title order={3}>TL;DR</Title>
            <Text>
              MagicRedact processes documents in two ways:
              <br />
              1. <strong>Manual Processing (Local)</strong>: All redaction happens in your
              browser—nothing is uploaded.
              <br />
              2. <strong>Auto-Redaction (Server-Based)</strong>: Documents are securely uploaded,
              processed, and then permanently deleted.
            </Text>
            <Text mt="sm" fw={500}>
              Please note: MagicRedact is not HIPAA compliant.
            </Text>
          </Paper>
          <Text>
            We respect your privacy and the importance of the information you entrust to
            MagicRedact. This Privacy Policy describes our policies and procedures on the
            collection, use, and disclosure of your information when you use our Service and
            explains your privacy rights and how the law protects you.
          </Text>
          <Text>
            By accessing or using the Service, you expressly consent to our collection, use, and
            disclosure of the information that you provide as described in this Privacy Policy.
          </Text>

          <Title order={2}>Interpretation and Definitions</Title>
          <Title order={3}>Interpretation</Title>
          <Text>
            The words with the initial letter capitalized have meanings defined under the following
            conditions. These definitions apply regardless of whether they appear in singular or
            plural.
          </Text>
          <Title order={3}>Definitions</Title>
          <List>
            <ListItem>
              <Text component="span" fw={500}>
                Account
              </Text>{' '}
              means a unique account created for you to access our Service.
            </ListItem>
            <ListItem>
              <Text component="span" fw={500}>
                Company
              </Text>{' '}
              (referred to as "the Company", "We", "Us", or "Our") refers to MagicRedact
            </ListItem>
            <ListItem>
              <Text component="span" fw={500}>
                Service
              </Text>{' '}
              refers to the MagicRedact application, website, and related services.
            </ListItem>
            <ListItem>
              <Text component="span" fw={500}>
                Document Processing Methods
              </Text>{' '}
              means either Manual Processing (where documents are processed locally in your browser)
              or Auto-Redaction (where documents are processed on our servers).
            </ListItem>
            <ListItem>
              <Text component="span" fw={500}>
                Personal Data
              </Text>{' '}
              means any information that directly or indirectly identifies an individual.
            </ListItem>
            <ListItem>
              <Text component="span" fw={500}>
                Usage Data
              </Text>{' '}
              refers to data collected automatically from your use of our Service.
            </ListItem>
          </List>

          <Title order={2}>Document Processing and Data Collection</Title>
          <Title order={3}>Document Processing Methods</Title>
          <Text>Our Service provides two distinct methods for processing documents:</Text>
          <List type="ordered">
            <ListItem>
              <Text fw={500}>Manual Processing (Local)</Text>
              <Text>
                When you choose to manually redact documents, all processing occurs locally in your
                web browser. The documents and images never leave your device, ensuring the complete
                privacy of your sensitive information.
              </Text>
            </ListItem>
            <ListItem>
              <Text fw={500}>Auto-Redaction (Server-Based)</Text>
              <Text>
                When you use our Auto-Redaction feature, documents are securely transmitted to our
                servers where they are processed to identify sensitive information. Immediately
                after processing, the documents/images are permanently deleted from our servers. No
                copies are retained.
              </Text>
            </ListItem>
          </List>

          <Title order={3}>Personal Data Collection</Title>
          <Text>
            While using our Service, we may ask you to provide certain personal information to
            contact or identify you. This personal information may include:
          </Text>
          <List>
            <ListItem>Email address</ListItem>
            <ListItem>First and last name</ListItem>
            <ListItem>
              Payment information (processed securely by our third-party payment processor)
            </ListItem>
            <ListItem>Any other information you choose to provide</ListItem>
          </List>

          <Title order={3}>Usage Data</Title>
          <Text>
            We automatically collect data on how you interact with our Service. This may include
            your browser type, browser version, the pages you visit, the dates and times of your
            visits, the time spent on pages, unique device identifiers, and other diagnostic
            information.
          </Text>

          <Title order={2}>Use of Your Data</Title>
          <Text>We use the collected data for various purposes, including:</Text>
          <List>
            <ListItem>Providing and maintaining our Service</ListItem>
            <ListItem>Notifying you about changes or updates to our Service</ListItem>
            <ListItem>Processing transactions and payments</ListItem>
            <ListItem>Offering customer support and responding to your inquiries</ListItem>
            <ListItem>Analyzing usage patterns to improve our Service</ListItem>
            <ListItem>Detecting, preventing, and addressing technical issues</ListItem>
          </List>

          <Title order={2}>Data Retention and Deletion</Title>
          <Text>
            For our Auto-Redaction service, all processed documents and images are automatically and
            permanently deleted from our servers after processing is complete. We do not retain
            copies of any documents.
          </Text>
          <Text>
            Personal Data and Usage Data collected to provide our Service are retained only as long
            as necessary for the purposes set forth in this Privacy Policy or as required by
            applicable laws.
          </Text>

          <Title order={2}>Disclosure of Personal Information</Title>
          <Text>We may share your personal information in the following circumstances:</Text>
          <List>
            <ListItem>
              <Text fw={500}>Business Transactions:</Text> In the event of a merger, acquisition, or
              asset sale, your data may be transferred.
            </ListItem>
            <ListItem>
              <Text fw={500}>Service Providers:</Text> We may share your data with third-party
              vendors (e.g., payment processors, analytics, cloud providers) who help us provide our
              Service.
            </ListItem>
            <ListItem>
              <Text fw={500}>Legal Requirements:</Text> We may disclose your information when
              required to do so by law or in response to valid requests from public authorities.
            </ListItem>
          </List>

          <Title order={2}>Security of Your Personal Data</Title>
          <Text>
            The security of your data is important to us. We have implemented commercially
            reasonable safeguards, including physical, electronic, and procedural measures, to
            protect your Personal Data. Specifically:
          </Text>
          <List>
            <ListItem>
              Manual Processing occurs solely within your browser, ensuring no data transmission.
            </ListItem>
            <ListItem>
              Data transmitted for Auto-Redaction is encrypted with industry-standard protocols.
            </ListItem>
            <ListItem>We enforce strict access controls on our processing systems.</ListItem>
            <ListItem>
              All processed documents are permanently deleted immediately after processing.
            </ListItem>
          </List>
          <Text>
            While we strive to protect your Personal Data, no transmission method or storage system
            is completely 100% secure.
          </Text>

          <Title order={2}>Your Data Protection Rights</Title>
          <Text>
            Depending on your jurisdiction, you may have the following rights regarding your
            Personal Data:
          </Text>
          <List>
            <ListItem>The right to access your Personal Data</ListItem>
            <ListItem>The right to rectify or correct inaccurate data</ListItem>
            <ListItem>
              The right to request deletion of your Personal Data (subject to certain exceptions)
            </ListItem>
            <ListItem>The right to restrict or object to our processing of your data</ListItem>
            <ListItem>The right to data portability</ListItem>
            <ListItem>The right to withdraw consent (where applicable)</ListItem>
          </List>

          <Title order={2}>Children's Privacy</Title>
          <Text>
            Our Service is not directed to children under the age of 13. We do not knowingly collect
            Personal Data from children under 13. If you believe that a child under 13 has provided
            us with Personal Data, please contact us immediately so we can remove that information.
          </Text>

          <Title order={2}>Changes to This Privacy Policy</Title>
          <Text>
            We may update our Privacy Policy from time to time. Any changes will be posted on this
            page with an updated "Last updated" date. You are advised to review this Privacy Policy
            periodically to be informed about how we are protecting your information.
          </Text>

          <Title order={2}>Contact Us</Title>
          <Text>
            If you have any questions or concerns about this Privacy Policy, please contact me at
            <Anchor component={NextLink} href={`mailto:${CONFIG.support.email}`}>
              {CONFIG.support.email}
            </Anchor>
          </Text>

          <Title order={2}>State Specific Addendums</Title>
          <Text>This section supplements our Privacy Policy for residents of certain states.</Text>
          <Title order={3}>California Privacy Rights (CCPA)</Title>
          <Text>California residents have the right to request:</Text>
          <List>
            <ListItem>Disclosure of the categories of Personal Data we collect about you</ListItem>
            <ListItem>Access to the specific pieces of Personal Data we hold about you</ListItem>
            <ListItem>Request deletion of your Personal Data</ListItem>
            <ListItem>
              Opt out of the sale of your Personal Data (please note, we do not sell your data)
            </ListItem>
          </List>
          <Title order={3}>European Union Data Protection (GDPR)</Title>
          <Text>
            If you are located in the European Economic Area, you have certain rights regarding your
            Personal Data, including the right to access, correct, or delete your information.
            Please contact us to exercise these rights.
          </Text>
          <Title order={3}>Canada Privacy – PIPEDA</Title>
          <Text>
            Residents of Canada have rights under the Personal Information Protection and Electronic
            Documents Act (PIPEDA). To exercise these rights, please contact us.
          </Text>
        </Stack>
      </Container>
      <LinksFooter />
    </>
  );
}
