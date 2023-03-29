import React from "react";
import {Input,InputNumber ,Card,Row,Col,Space,Button,message } from "antd";
import { Configuration, OpenAIApi } from "openai";

const { TextArea } = Input;

const configuration = new Configuration({
    organization: "org-W7JizPlymKQmbj8JFbFy6yGn",
    apiKey: "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",
});
const openai = new OpenAIApi(configuration);

class Req extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            prompt: "",
            token: "",
            param: "{}",
            maxToken: 100,
            output: "",
            resToken:0,
            reqToken:0,
        };
    }

    req=async ()=>{
        var obj;
        try{
            obj = JSON.parse(this.state.param);
        }catch(e){
            message.error("对象参数输入有误");
            throw new Error("对象参数输入有误");
        }
        if(typeof obj!="object"){
            message.error("对象参数输入有误");
            throw new Error("对象参数输入有误");
        }
        openai.configuration.apiKey=this.state.token;
        var completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: this.state.prompt,
            max_tokens:+this.state.maxToken,
            ...obj,
        });
        console.log(completion);
        this.setState({output:completion.data.choices[0].text,
            reqToken:completion.data.usage.prompt_tokens,
            resToken:completion.data.usage.completion_tokens});
    }
    onChange=(event)=>{
        this.setState({[event.target.name]:event.target.value})
    }
    render() {
        let {token,param,prompt,maxToken,output,resToken,reqToken} = this.state;
        return  (
            <Row style={{paddingTop: 20}}>
                <Col span={11} push={1}>
                    <Space size={15} direction="vertical">
                        <Input name="token" placeholder="token" value={token} onChange={this.onChange} />
                        <Input name="maxToken" placeholder="最大令牌数" value={maxToken}  onChange={this.onChange}  />
                        <Input name="param" placeholder="参数" value={param} onChange={this.onChange} />
                        <TextArea  autoSize={true} name="prompt" placeholder="问题" value={prompt} onChange={this.onChange} />
                        <Button onClick={this.req}>请求</Button>
                        <span>请求消耗的token数量:{reqToken}</span>
                        <span>返回消耗的token数量:{resToken}</span>
                    </Space>
                </Col>
                <Col span={12}>
                    <Card title="Output">
                        <p style={{whiteSpace:"pre-wrap"}}>{output}</p>
                    </Card>
                </Col>
            </Row>
        )
  }

}
export default Req;