"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../components/AiPage/Header";
import Footer from "../components/AiPage/Footer";

const TermsOfUse = () => {
  return (
    <>
      <div>
        <Header />
        <AnimatePresence>
          <div className="overflow-hidden">
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
              className="py-20 poppins-text w-[95%] md:w-[90%] lg:w-[70%] xl:w-[65%] mx-auto text-justify"
            >
              <motion.p
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
                className="text-center font-semibold text2xl md:text-3xl py-10"
              >
                Legal Terms of Use
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.1,
                  scale: {
                    type: "spring",
                    damping: 14,
                    stiffness: 200,
                    restDelta: 0.001,
                  },
                }}
              >
                <motion.p className="my-7">
                  Welcome to Fb Marketplace Chatbot ("the Bot," "we," "us," or
                  "our"). These Terms of Use ("Terms") govern your access to and
                  use of the Bot, an automated service designed to facilitate
                  interactions and transactions on Facebook Marketplace.
                </motion.p>
                <motion.p className="mb-10">
                  By using the Bot, you agree to be bound by these Terms and our
                  Privacy Policy. If you do not agree, you may not use the Bot.
                  These Terms constitute a legally binding agreement between you
                  and Fb Marketplace Chatbot.
                </motion.p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: "40%", scale: 0.7 }}
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
                  1. Description of Service
                </motion.p>
                <motion.p>
                  The Bot is a tool that operates within the Facebook Messenger
                  platform to help users with tasks related to Facebook
                  Marketplace, such as searching for items, responding to
                  inquiries, or managing listings. The Bot acts as an
                  intermediary and is not a party to any transactions between
                  users. All transactions, communications, and disputes are
                  governed by Facebook's own terms and policies.
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
                  2. User Responsibilities and Conduct
                </motion.p>
                <motion.p>
                  You agree to use the Bot and Facebook Marketplace in a
                  responsible and lawful manner. You are solely responsible for
                  all content you send through the Bot and for all transactions
                  you enter into. You agree to: <br />
                  Comply with all applicable laws and regulations. <br />
                  Adhere to Facebook's Platform Policies, Terms of Service, and
                  Community Standards. <br />
                  Not use the Bot for any illegal or fraudulent purpose,
                  including but not limited to scams, spamming, or phishing.{" "}
                  <br />
                  Not post or transmit content that is defamatory, obscene,
                  harassing, or otherwise objectionable. <br />
                  Not use the Bot to violate the intellectual property rights of
                  others. <br />
                  Be respectful and honest in all communications with other
                  users. <br />
                  Failure to comply with these responsibilities may result in
                  the immediate termination of your access to the Bot.
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
                  3. Intellectual Property Rights
                </motion.p>
                <motion.p>
                  All content, features, and functionality of the Bot, including
                  but not limited to its software, design, and branding, are the
                  exclusive property of Fb Marketplace Chatbot and are protected
                  by copyright, trademark, and other intellectual property laws. <br/>

                  You may not copy, modify, distribute, sell, or lease any part
                  of the Bot's services or software.
                </motion.p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: "40%", scale: 0.7 }}
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
                  4. Disclaimer of Warranties
                </motion.p>
                <motion.p>
                  THE BOT IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS,
                  WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE
                  DO NOT GUARANTEE THAT THE BOT WILL BE UNINTERRUPTED,
                  ERROR-FREE, SECURE, OR ACCURATE. YOU USE THE BOT AT YOUR OWN
                  RISK. <br/>
                  WE ARE NOT RESPONSIBLE FOR THE ACTIONS, CONTENT, OR DATA
                  OF THIRD PARTIES, INCLUDING OTHER USERS, AND YOU RELEASE US
                  FROM ANY CLAIMS AND DAMAGES, KNOWN AND UNKNOWN, ARISING OUT OF
                  OR IN ANY WAY CONNECTED WITH ANY CLAIM YOU HAVE AGAINST ANY
                  SUCH THIRD PARTIES.
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
                  5. Limitation of Liability
                </motion.p>
                <motion.p>
                  TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL [YOUR
                  BUSINESS NAME], ITS AFFILIATES, OFFICERS, EMPLOYEES, AGENTS,
                  SUPPLIERS, OR LICENSORS BE LIABLE FOR ANY INDIRECT,
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
                  INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE,
                  GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN
                  CONNECTION WITH YOUR ACCESS TO OR USE OF OR INABILITY TO
                  ACCESS OR USE THE BOT.
                </motion.p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: "40%", scale: 0.7 }}
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
                  6. Indemnification
                </motion.p>
                <motion.p>
                  You agree to indemnify and hold harmless [Your Business Name],
                  its affiliates, officers, agents, and employees from and
                  against any and all claims, damages, obligations, losses,
                  liabilities, costs, or debt, and expenses (including but not
                  limited to attorney's fees) arising from: (a) your use of and
                  access to the Bot; (b) your violation of any term of these
                  Terms; (c) your violation of any third-party right, including
                  without limitation any intellectual property right or privacy
                  right; or (d) any claim that your use of the Bot caused damage
                  to a third party.
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
                  7. Changes to the Terms
                </motion.p>
                <motion.p>
                  We reserve the right, at our sole discretion, to modify or
                  replace these Terms at any time. If a revision is material, we
                  will make reasonable efforts to provide at least 30 days'
                  notice prior to any new terms taking effect. By continuing to
                  access or use our Bot after those revisions become effective,
                  you agree to be bound by the revised terms.
                </motion.p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: "40%", scale: 0.7 }}
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
                  8. Termination
                </motion.p>
                <motion.ul className="list-disc ml-5">
                  <motion.li>
                    We may terminate or suspend your access to the Bot
                    immediately, without prior notice or liability, for any
                    reason whatsoever, including without limitation if you
                    breach the Terms. All provisions of the Terms which by their
                    nature should survive termination shall survive termination,
                    including, without limitation, ownership provisions,
                    warranty disclaimers, indemnity, and limitations of
                    liability.
                  </motion.li>
                </motion.ul>
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
                  9. Governing Law
                </motion.p>
                <motion.ul className="list-disc ml-5">
                  <motion.li>
                    These Terms shall be governed and construed in accordance
                    with the laws of [Your State/Country], without regard to its
                    conflict of law provisions.
                  </motion.li>
                </motion.ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: "40%", scale: 0.7 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  scale: {
                    type: "spring",
                    damping: 20,
                    stiffness: 200,
                    restDelta: 0.001,
                  },
                }}
              >
                <motion.p className="font-semibold mb-2 mt-8">
                  10. Contact Us
                </motion.p>
                <motion.ul className="list-disc ml-5">
                  <motion.li>
                    If you have any questions about these Terms, please contact
                    us at: info@fbmarketplacebots.com
                  </motion.li>
                </motion.ul>
              </motion.div>
            </motion.div>
          </div>
        </AnimatePresence>
        <Footer />
      </div>
    </>
  );
};

export default TermsOfUse;
