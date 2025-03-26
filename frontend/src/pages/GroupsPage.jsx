import React from 'react';
import { Card, Table, Button, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { api } from '../api/api';

const GroupsPage = () => {
    const navigate = useNavigate();

    const columns = [
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Описание',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="primary" onClick={() => navigate(`/groups/${record.id}`)}>
                        Подробнее
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title="Группы"
                extra={
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/groups/create')}
                    >
                        Создать группу
                    </Button>
                }
            >
                <Table 
                    columns={columns} 
                    dataSource={[]} 
                    rowKey="id"
                />
            </Card>
        </div>
    );
};

export default GroupsPage; 