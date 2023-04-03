import React from "react";
import {Input, Select, Card, Row, Col, Space, Button, message} from "antd";
import {Configuration, OpenAIApi} from "openai";

const {TextArea} = Input;

const configuration = new Configuration({
    organization: "org-t6AFcmldZLPrM2sYOZXJa07O",
    apiKey: "",
});
const openai = new OpenAIApi(configuration);
const options = {
    complete: {value: 'complete', label: '补全对话'},
    chat: {value: 'chat', label: '对话'},
    images: {value: 'images', label: '创建图像'},
    editImages: {value: 'editImages', label: '修改图像', disabled: true},
}
const sizeOptions = [
    {lable: "256x256", value: "256x256"},
    {lable: "512x512", value: "512x512"},
    {lable: "1024x1024", value: "1024x1024"}
]

class Req extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            prompt: "",
            token: "",
            param: "{}",
            maxToken: 100,
            output: "",
            resToken: 0,
            reqToken: 0,
            type: options.images.value,
            pictureNum: 1,
            imageSrc: "",
            size: sizeOptions[0].value,
            user: 'yuanqiao',
            chats: [],
            system: "",
            change: false,
        };
    }

    req = async () => {
        var obj;
        try {
            obj = JSON.parse(this.state.param);
        } catch (e) {
            message.error("对象参数输入有误");
            throw new Error("对象参数输入有误");
        }
        if (typeof obj != "object") {
            message.error("对象参数输入有误");
            throw new Error("对象参数输入有误");
        }
        if (this.state.token) {
            openai.configuration.apiKey = this.state.token;
            openai.configuration.baseOptions.headers.Authorization = "Bearer " + openai.configuration.apiKey;
        }
        var completion;
        switch (this.state.type) {
            case options.complete.value: {
                completion = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: this.state.prompt,
                    max_tokens: this.state.maxToken,
                    ...obj,
                });
                this.setState({
                    output: completion.data.choices[0].text,
                    reqToken: completion.data.usage.prompt_tokens,
                    resToken: completion.data.usage.completion_tokens
                });
                break;
            }
            case options.chat.value: {
                await this.setState({
                    chats: [...this.state.chats, {role: "user", content: this.state.prompt}],
                    change: true
                })
                completion = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: this.state.system
                        ? [{role: "system", content: this.state.system}, ...this.state.chats]
                        : [...this.state.chats],
                })
                console.log(completion);
                this.setState({
                    chats: [
                        ...this.state.chats,
                        {role: "assistant", content: completion.data.choices[0].message.content}
                    ]
                })
                break;
            }
            case options.images.value: {
                completion = await openai.createImage({
                    prompt: this.state.prompt,
                    n: this.state.pictureNum,
                    size: this.state.size,
                    user: this.state.user,
                    ...obj,
                });
                this.setState({
                    output: completion.data.data[0].url,
                    // reqToken: completion.data.usage.prompt_tokens,
                    // resToken: completion.data.usage.completion_tokens
                });
                break;
            }
            default: {
                message.error("未定义或未开发的接口");
                throw new Error("未定义或未开发的接口");
            }
        }
    }
    onChange = (event) => {
        this.setState({[event.target.name]: event.target.value})
    }
    changType = (type) => {
        this.setState({type: type})
    }
    changeSize = (size) => {
        this.setState({size: size})
    }
    render() {
        let {token, param, prompt, maxToken, output, resToken, reqToken, user, pictureNum, system} = this.state;
        return (
            <Row style={{paddingTop: 20}}>
                <Col span={11} push={1}>
                    <Space size={15} direction="vertical">
                        <Select name="type"
                            options={[...Object.values(options)]}
                            value={this.state.type}
                            onChange={this.changType}
                        />
                        <Input name="token" placeholder="token" value={token} onChange={this.onChange} />
                        {this.state.type === options.complete.value &&
                            <Input name="maxToken" placeholder="最大令牌数" value={maxToken} onChange={this.onChange} />
                        }
                        {this.state.type === options.chat.value &&
                            <TextArea name="system" placeholder="设定" value={system} onChange={this.onChange} />
                        }
                        {this.state.type === options.images.value &&
                            <>
                                <Input name="pictureNum" placeholder="图片数量" value={pictureNum} onChange={this.onChange} />
                                <Select name="size" placeholder="尺寸"
                                    value={this.state.size}
                                    options={sizeOptions}
                                    onChange={this.changeSize} />
                                <Input name="user" placeholder="制作者" value={user} onChange={this.onChange} />
                            </>
                        }
                        <Input name="param" placeholder="参数" value={param} onChange={this.onChange} />
                        <TextArea autoSize={true} name="prompt" placeholder="问题" value={prompt} onChange={this.onChange} />
                        <Button onClick={this.req}>请求</Button>
                        {this.state.type === options.complete.value
                            && <>
                                <span>请求消耗的token数量:{reqToken}</span>
                                <span>返回消耗的token数量:{resToken}</span>
                            </>
                        }
                    </Space>
                </Col>
                <Col span={12}>
                    <Card title="Output">
                        {
                            (() => {
                                switch (this.state.type) {
                                    case options.images.value: {
                                        return <img src={output} alt="" />
                                    }
                                    case options.complete.value: {
                                        return <p style={{whiteSpace: "pre-wrap"}}>{output}</p>
                                    }
                                    case options.chat.value: {
                                        return <>
                                            {this.state.chats.map((x, y) => {
                                                if (x.role === "user") {
                                                    return <p index={y}>用户:{x.content}</p>
                                                } if (x.role === "assistant") {
                                                    return <p index={y}>AI:{x.content}</p>
                                                }
                                                return ""
                                            })}
                                        </>
                                    }
                                    default: {
                                        return ""
                                    }
                                }
                            })()
                        }
                    </Card>
                </Col>
            </Row >
        )
    }

}
export default Req;