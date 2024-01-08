import React from 'react';
import { Button, Checkbox, Form, Input } from 'antd';
import { DatePicker, Space } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const onFinish = (values: any) => {
    console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};

type FieldType = {
    username?: string;
    password?: string;
    remember?: string;
};

const AddActivityForm: React.FC = ({ formClick }) => (
    <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={(value) => formClick(value)}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
    >
        <Form.Item<FieldType>
            label="活动名称"
            name="activityName"
            rules={[{ required: true, message: 'Please input your username!' }]}
        >
            <Input />
        </Form.Item>

        <Form.Item<FieldType>
            label="参加人数"
            name="joinNumber"
            rules={[{ required: true, message: 'Please input your password!' }]}
        >
            <Input />
        </Form.Item>

        <Form.Item<FieldType>
            label="持续时间"
            name="durationTime"
            rules={[{ required: true, message: 'Please input your password!' }]}
        >
            <RangePicker
                defaultValue={[dayjs('2015/01/01', 'YYYY/MM/DD'), dayjs('2015/01/01', 'YYYY/MM/DD')]}
                format={'YYYY/MM/DD'}
            />
        </Form.Item>
        <Form.Item<FieldType>
            label="需要质押金额"
            name="joinMoney"
            rules={[{ required: true, message: 'Please input your password!' }]}
        >
            <Input />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
                Submit
            </Button>
        </Form.Item>
    </Form>
);

export default AddActivityForm;