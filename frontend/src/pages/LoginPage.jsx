import React from "react";
import { Layout, Card, Typography } from "antd";
import LoginForm from "../components/Auth/LoginForm";
import { motion } from "framer-motion";

const { Content } = Layout;
const { Title } = Typography;


export default function LoginPage({ onLoginSuccess }) {
  return (
    <Layout style={{ minHeight: "100vh", background: "#141414" }}>
      <Content style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            style={{ width: 400, textAlign: "center" }}
            variant={"outlined"}
            title={
              <Title level={3} style={{ marginBottom: 0 }}>
                TechDoc Builder
              </Title>
            }
          >
          <LoginForm onSuccess={onLoginSuccess} />
        </Card>
        </motion.div>
      </Content>
    </Layout>
  );
}