"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../components/AiPage/Header";
import Footer from "../components/AiPage/Footer";

const PrivacyPolicy = () => {
  return (
    <>
      <div>
        <Header />
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.1,
              scale: {
                type: "spring",
                damping: 50,
                stiffness: 200,
                restDelta: 0.001,
              },
            }}
            className="py-20 poppins-text overflow-hidden"
          >
            <motion.p
              initial={{ opacity: 0, x: "-40%" }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.6,
                scale: {
                  type: "spring",
                  damping: 50,
                  stiffness: 200,
                  restDelta: 0.001,
                },
              }}
              className="text-center text-2xl md:text-3xl poppins-text font-semibold py-10"
            >
              Privacy Policy
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.6,
                scale: {
                  type: "spring",
                  damping: 50,
                  stiffness: 200,
                  restDelta: 0.001,
                },
              }}
              className="w-[95%] md:w-[90%] lg:w-[70%] xl:w-[65%] mx-auto text-justify"
            >
              <motion.div
                initial={{ opacity: 0, x: "-40%" }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.6,
                  scale: {
                    type: "spring",
                    damping: 50,
                    stiffness: 200,
                    restDelta: 0.001,
                  },
                }}
              >
                <p className=" mb-3">Effective Date: 25 August, 2025</p>
                <p className="mb-5">
                  This Privacy Policy describes how Fb Marketplace Chatbot ("the
                  Bot," "we," "us," or "our") collects, uses, stores, and shares
                  information from users ("you" or "your") who interact with our
                  bot on the Facebook Messenger platform and/or Facebook
                  Marketplace. We are committed to protecting your privacy and
                  handling your data with transparency and care.
                </p>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.2,
                  scale: {
                    type: "spring",
                    damping: 10,
                    stiffness: 200,
                    restDelta: 0.001,
                  },
                }}
              >
                By using the Bot, you agree to the terms of this Privacy Policy.
                If you do not agree, please do not use the Bot.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, x: "-40%", scale: 0.7 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  scale: {
                    type: "spring",
                    damping: 14,
                    stiffness: 200,
                    restDelta: 0.001,
                  },
                }}
              >
                <motion.p className="font-semibold mb-2 mt-8">
                  1. Data Collection
                </motion.p>
                <motion.p>
                  We collect information to provide and improve the Bot's
                  functionality and to manage our services. The types of data we
                  collect include: <br />
                  Information You Provide Directly: When you interact with the
                  Bot, you may provide us with information directly. This may
                  include: <br />
                  User ID: We collect your unique Facebook User ID to identify
                  you and link your conversations and requests to your account.{" "}
                  <br />
                  Conversational Data: The content of your messages and
                  conversations with the Bot, including product inquiries,
                  negotiation details, and any other text or images you send.{" "}
                  <br />
                  Listing Information: Information about items you are
                  interested in buying or selling through the Bot, such as
                  product descriptions, prices, and images. <br />
                  Contact Information: If you provide it voluntarily for
                  communication purposes (e.g., an email address for receiving
                  notifications). <br />
                  Information Collected Automatically: We may automatically
                  collect certain technical information when you interact with
                  the Bot. This may include: <br />
                  Timestamp: The date and time of your interactions with the
                  Bot.
                  <br />
                  Device Information: Information about the device and software
                  you use to access Facebook Messenger, such as device type and
                  operating system. <br />
                  Usage Data: Details about how you use the Bot, such as the
                  features you access, the commands you use, and the frequency
                  and duration of your interactions. <br />
                  Note: We do not collect or store sensitive personal
                  information such as your full name, physical address, phone
                  number, or payment details unless you explicitly provide it
                  for a specific, aformentioned purpose, such as a negotiation
                  or transaction facilitated by the Bot. We never collect or
                  store your Facebook password. <br />
                </motion.p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: "-40%", scale: 0.7 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  scale: {
                    type: "spring",
                    damping: 14,
                    stiffness: 200,
                    restDelta: 0.001,
                  },
                }}
              >
                <motion.p className="font-semibold mb-2 mt-8">
                  2. Handling of User Data
                </motion.p>
                <motion.p>
                  We handle your data responsibly and for specific, legitimate
                  purposes. The data we collect is used to: <br />
                  Provide and operate the Bot: To allow you to interact with the
                  Bot, respond to your inquiries, facilitate transactions, and
                  provide customer support.
                  <br />
                  Improve the Bot's functionality: To analyze user behavior and
                  feedback to enhance the Bot's features, conversational
                  abilities, and overall user experience. <br />
                  Communicate with you: To send you messages related to your use
                  of the Bot, such as transaction updates or responses to your
                  queries. <br />
                  Ensure compliance and security: To detect and prevent
                  fraudulent or malicious activity, and to ensure compliance
                  with the Facebook Platform Policies and all applicable laws.{" "}
                  <br />
                </motion.p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: "-40%", scale: 0.7 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  scale: {
                    type: "spring",
                    damping: 14,
                    stiffness: 200,
                    restDelta: 0.001,
                  },
                }}
              >
                <motion.p className="font-semibold mb-2 mt-8">
                  3. Data Storage
                </motion.p>
                <motion.p>
                  We are committed to the secure storage of your data. <br />
                  Data Security: We implement a variety of security measures to
                  protect your information from unauthorized access, use, or
                  disclosure. This includes technical and organizational
                  safeguards such as data encryption, access controls, and
                  secure servers. <br />
                  Data Retention: We retain your personal data for as long as
                  necessary to fulfill the purposes for which it was collected,
                  as described in this Privacy Policy. Generally, we will retain
                  your conversational data and related information for a limited
                  period after your last interaction, to assist with future
                  inquiries and to improve our service. We will delete or
                  anonymize your data when it is no longer needed. <br />
                </motion.p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: "-40%", scale: 0.7 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  scale: {
                    type: "spring",
                    damping: 14,
                    stiffness: 200,
                    restDelta: 0.001,
                  },
                }}
              >
                <motion.p className="font-semibold mb-2 mt-8">
                  4. Data Sharing
                </motion.p>
                <motion.p>
                  We do not sell your personal data to third parties. We may
                  share your information in the following limited circumstances:{" "}
                  <br />
                  With Facebook/Meta: Your interaction with the Bot is through
                  the Facebook Messenger platform, and as such, your data is
                  processed in accordance with Facebook's own Data Policy. We
                  share data with Facebook as required for the Bot to operate
                  and to comply with their platform policies. <br />
                  With Service Providers: We may use third-party services to
                  assist us in operating the Bot, such as hosting providers or
                  analytics services. These third parties are only granted
                  access to the data necessary to perform their specific tasks
                  and are contractually obligated to protect your data and
                  handle it in accordance with this Privacy Policy. <br />
                  In a Business Transfer: If we are involved in a merger,
                  acquisition, or sale of assets, your information may be
                  transferred as part of that transaction. We will notify you of
                  any such change. <br />
                  For Legal Reasons: We may disclose your information if
                  required to do so by law, court order, or governmental
                  request, or if we believe such action is necessary to protect
                  our rights, the safety of our users, or to prevent illegal
                  activity. <br />
                </motion.p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: "-40%", scale: 0.7 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  scale: {
                    type: "spring",
                    damping: 14,
                    stiffness: 200,
                    restDelta: 0.001,
                  },
                }}
              >
                <motion.p className="font-semibold mb-2 mt-8">
                  5. Your Rights and Control Over Your Data
                </motion.p>
                <motion.p>
                  You have the right to access, correct, or delete your personal
                  data. <br />
                  Requesting Data Deletion: If you would like to have your data
                  deleted from our systems, you can send us a request via email
                  at info@fbmarketplacebots.com or by using the Bot command
                  delete my data. Upon receiving a valid request, we will take
                  all reasonable steps to delete your data from our active
                  databases, in accordance with applicable legal obligations.{" "}
                  <br />
                  Accessing Your Data: To request access to the data we have
                  collected about you, please send an email to
                  info@fbmarketplacebots.com. <br />
                  Facebook Controls: You also have control over your data
                  through your Facebook account settings. Please refer to the
                  Facebook Data Policy for information on how to manage your
                  privacy settings and permissions on their platform.
                </motion.p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: "-40%", scale: 0.7 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  scale: {
                    type: "spring",
                    damping: 14,
                    stiffness: 200,
                    restDelta: 0.001,
                  },
                }}
              >
                <motion.p className="font-semibold mb-2 mt-8">
                  6. Children's Privacy
                </motion.p>
                <motion.p>
                  The Bot is not intended for use by children under the age of
                  13. We do not knowingly collect personal data from children
                  under 13. If we become aware that we have collected
                  information from a child under 13 without verifiable parental
                  consent, we will take steps to delete that information.
                </motion.p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: "-40%", scale: 0.7 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  scale: {
                    type: "spring",
                    damping: 14,
                    stiffness: 200,
                    restDelta: 0.001,
                  },
                }}
              >
                <motion.p className="font-semibold mb-2 mt-8">
                  7. Changes to this Privacy Policy
                </motion.p>
                <motion.p>
                  We may update this Privacy Policy from time to time. We will
                  notify you of any significant changes by posting the new
                  policy on this page and updating the "Last Updated" date. Your
                  continued use of the Bot after any changes constitutes your
                  acceptance of the new Privacy Policy.
                </motion.p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: "-40%", scale: 0.7 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  scale: {
                    type: "spring",
                    damping: 14,
                    stiffness: 200,
                    restDelta: 0.001,
                  },
                }}
              >
                <motion.p className="font-semibold mb-2 mt-8">
                  8. Contact Us
                </motion.p>
                <motion.p>
                 If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at: info@fbmarketplacebots.com
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolicy;
