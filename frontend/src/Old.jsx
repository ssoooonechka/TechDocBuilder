import React, { useState, useEffect, useRef, useCallback } from "react";
import { Typography, Layout, Button, Select, message, ConfigProvider, theme, Input, Avatar, Badge, Space, Modal, Tabs, Form, Switch } from "antd";
import { CodeOutlined, EyeOutlined, SplitCellsOutlined, SaveOutlined, DownloadOutlined, UserOutlined, CopyOutlined, FileAddOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { marked } from "marked";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const { darkAlgorithm } = theme;
const { Header, Content } = Layout;
const { Option } = Select;
const { Text } = Typography;
const { TabPane } = Tabs;

const templates = {
  "Basic Layout": {
    content: `# Title\n\n## Subtitle\n\n- Point one\n- Point two`,
    indentType: 'spaces',
    indentSize: 4
  },
  "API Doc": {
    content: `### Endpoint: /api/v1/resource\n\n**Method:** GET\n\n**Response:**\n\n\`\`\`json\n{\n  "id": 1,\n  "name": "example"\n}\n\`\`\``,
    indentType: 'spaces',
    indentSize: 2
  },
"Python Code": {
  content: "```python\ndef example():\n    print(\"Hello\")\n    if True:\n        print(\"Indented\")\n```",
  indentType: 'spaces',
  indentSize: 4
}
};

export default function App() {
  const [mode, setMode] = useState("split");
  const [roomId, setRoomId] = useState("");
  const [users, setUsers] = useState([]);
  const [content, setContent] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newRoomId, setNewRoomId] = useState("");
  const [activeTab, setActiveTab] = useState("edit");
  const [indentType, setIndentType] = useState("spaces");
  const [indentSize, setIndentSize] = useState(4);
  const [isTemplatePublic, setIsTemplatePublic] = useState(false);
  
  const editorRef = useRef(null);
  const ydocRef = useRef(new Y.Doc());
  const providerRef = useRef(null);

  const createRoom = useCallback(async () => {
    setIsCreatingRoom(true);
    try {
      const response = await fetch("http://localhost:8000/create-room", {
        method: "POST"
      });
      const data = await response.json();
      setNewRoomId(data.room_id);
      setIsModalVisible(true);
      message.success("Room created successfully!");
    } catch (error) {
      message.error("Failed to create room");
      console.error(error);
    } finally {
      setIsCreatingRoom(false);
    }
  }, []);

  const joinRoom = useCallback(() => {
    if (!roomId) return message.error("Please enter room ID");
    
    if (providerRef.current) {
      providerRef.current.destroy();
    }

    const ydoc = ydocRef.current;
    const ytext = ydoc.getText("content");
    
    const provider = new WebsocketProvider(
      "ws://localhost:8000/ws",
      roomId,
      ydoc
    );

    provider.on("status", (event) => {
      console.log("WebSocket status:", event.status);
    });

    provider.on("peers", (peers) => {
      setUsers(Array.from(peers.keys()));
    });

    const observer = () => {
      const currentText = ytext.toString();
      setContent(currentText);
      if (editorRef.current) {
        editorRef.current.value = currentText;
      }
    };
    
    ytext.observe(observer);
    providerRef.current = provider;

    if (ytext.length === 0) {
      ytext.insert(0, templates["Basic Layout"].content);
    }

    observer();
    message.success(`Connected to room: ${roomId}`);

    return () => {
      ytext.unobserve(observer);
      provider.destroy();
    };
  }, [roomId]);

  const handleEditorChange = useCallback((e) => {
    const newText = e.target.value;
    const ytext = ydocRef.current.getText("content");
    ytext.delete(0, ytext.length);
    ytext.insert(0, newText);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const indent = indentType === 'spaces' ? ' '.repeat(indentSize) : '\t';
      
      const newText = 
        content.substring(0, selectionStart) + 
        indent + 
        content.substring(selectionEnd);
      
      setContent(newText);
      
      const ytext = ydocRef.current.getText("content");
      ytext.delete(0, ytext.length);
      ytext.insert(0, newText);
      
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + indent.length;
      }, 0);
    }
  }, [content, indentType, indentSize]);

  const saveTemplate = useCallback(async () => {
    const name = prompt("Enter template name:");
    if (!name) return;

    try {
      const response = await fetch("http://localhost:8000/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          content,
          indentType,
          indentSize,
          isPublic: isTemplatePublic
        })
      });

      if (response.ok) {
        message.success("Template saved successfully!");
      } else {
        message.error("Failed to save template");
      }
    } catch (error) {
      message.error("Error saving template");
      console.error(error);
    }
  }, [content, indentType, indentSize, isTemplatePublic]);

  const loadTemplate = useCallback((template) => {
    setContent(template.content);
    setIndentType(template.indentType || 'spaces');
    setIndentSize(template.indentSize || 4);
    
    const ytext = ydocRef.current.getText("content");
    ytext.delete(0, ytext.length);
    ytext.insert(0, template.content);
    
    message.success(`Template "${template.name}" loaded`);
  }, []);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(newRoomId);
    message.success("Room ID copied to clipboard!");
  }, [newRoomId]);

  const handleJoinNewRoom = useCallback(() => {
    setRoomId(newRoomId);
    setIsModalVisible(false);
    joinRoom();
  }, [newRoomId, joinRoom]);

  useEffect(() => {
    return () => {
      if (providerRef.current) {
        providerRef.current.destroy();
      }
    };
  }, []);

  const renderEditor = () => (
    <textarea
      ref={editorRef}
      value={content}
      onChange={handleEditorChange}
      onKeyDown={handleKeyDown}
      style={{ 
        width: "100%", 
        height: "100%", 
        background: "#1e1e1e", 
        color: "#fff", 
        border: "none", 
        padding: 16,
        fontFamily: 'monospace',
        whiteSpace: 'pre',
        tabSize: indentSize
      }}
    />
  );

  const renderPreview = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: "#1e1e1e",
        color: "#fff",
        padding: 16,
        height: "100%",
        overflowY: "auto",
      }}
      dangerouslySetInnerHTML={{ __html: marked(content) }}
    />
  );

  return (
    <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
      <Layout style={{ minHeight: "100vh" }}>
        <Header style={{ background: "#141414", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: "#fff", fontSize: 18 }}>TechDoc Builder</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Button 
              type="primary" 
              onClick={createRoom}
              loading={isCreatingRoom}
              icon={<FileAddOutlined />}
            >
              Create Room
            </Button>
            
            <Input
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              style={{ width: 200 }}
            />
            
            <Button 
              type="primary" 
              onClick={joinRoom}
              disabled={!roomId}
            >
              Join Room
            </Button>
            
            {users.length > 0 && (
              <Badge count={users.length}>
                <Avatar icon={<UserOutlined />} />
              </Badge>
            )}
            
            <Select 
              value={mode} 
              onChange={setMode} 
              style={{ width: 120 }}
            >
              <Option value="code"><CodeOutlined /> Code</Option>
              <Option value="preview"><EyeOutlined /> Preview</Option>
              <Option value="split"><SplitCellsOutlined /> Split</Option>
            </Select>
          </div>
        </Header>
        
        <Content style={{ padding: 16, background: "#141414" }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Editor" key="edit">
              {mode === "code" && renderEditor()}
              {mode === "preview" && renderPreview()}
              {mode === "split" && (
                <div style={{ display: "flex", gap: 16, height: "calc(100vh - 180px)" }}>
                  <div style={{ flex: 1 }}>{renderEditor()}</div>
                  <div style={{ flex: 1 }}>{renderPreview()}</div>
                </div>
              )}
            </TabPane>
            <TabPane tab="Templates" key="templates">
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#fff' }}>Built-in Templates</h3>
                  {Object.entries(templates).map(([name, template]) => (
                    <div key={name} style={{ 
                      background: '#1e1e1e', 
                      padding: 12, 
                      marginBottom: 8,
                      cursor: 'pointer'
                    }} onClick={() => loadTemplate(template)}>
                      <Text strong style={{ color: '#fff' }}>{name}</Text>
                      <Text style={{ color: '#aaa', display: 'block' }}>
                        Indent: {template.indentSize} {template.indentType}
                      </Text>
                    </div>
                  ))}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#fff' }}>Save Current</h3>
                  <Form layout="vertical" style={{ color: '#fff' }}>
                    <Form.Item label="Indent Type">
                      <Select 
                        value={indentType}
                        onChange={setIndentType}
                        style={{ width: 120 }}
                      >
                        <Option value="spaces">Spaces</Option>
                        <Option value="tabs">Tabs</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item label="Indent Size">
                      <Input 
                        type="number" 
                        value={indentSize}
                        onChange={(e) => setIndentSize(parseInt(e.target.value) || 4)}
                        min={1}
                        max={8}
                        disabled={indentType === 'tabs'}
                        style={{ width: 80 }}
                      />
                    </Form.Item>
                    <Form.Item label="Public Template">
                      <Switch 
                        checked={isTemplatePublic}
                        onChange={setIsTemplatePublic}
                      />
                    </Form.Item>
                    <Button 
                      type="primary" 
                      onClick={saveTemplate}
                      icon={<SaveOutlined />}
                    >
                      Save as Template
                    </Button>
                  </Form>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </Content>

        <Modal
          title="Room Created Successfully"
          visible={isModalVisible}
          onOk={handleJoinNewRoom}
          onCancel={() => setIsModalVisible(false)}
          okText="Join Room"
          cancelText="Close"
        >
          <Space direction="vertical">
            <Text>Share this Room ID with others:</Text>
            <Space>
              <Input 
                value={newRoomId} 
                readOnly 
                style={{ width: 300 }} 
              />
              <Button 
                icon={<CopyOutlined />} 
                onClick={copyToClipboard}
              />
            </Space>
          </Space>
        </Modal>
      </Layout>
    </ConfigProvider>
  );
}