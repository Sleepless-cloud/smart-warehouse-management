/*
该网页有两个主要页面：物品管理，仓库动态。应该实现以下主要功能：
1)物品管理页面可以实现以下功能：添加物品(物品名称、编号，库存阈值，创建时间，修改时间，操作人)，选择物品进行入库操作（填写入库数量，经手人，备注，显示修改时间），选择物品进行出库操作（填写出库数量，经手人，备注，显示修改时间），库存查询
(2)仓库动态页面可以实现以下功能：显示出入库操作，物品编号，物品名称，操作后库存，操作数量，修改时间，经手人。
*/

-- 创建 items 表（物品表）
CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT '物品名称',
  item_number VARCHAR(100) NOT NULL COMMENT '物品编号',
  unit VARCHAR(50) COMMENT '单位',
  specification VARCHAR(100) COMMENT '规格',
  stock_quantity INT NOT NULL DEFAULT 0 COMMENT '库存数量',
  threshold INT NOT NULL DEFAULT 0 COMMENT '库存阈值',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  operator_id INT DEFAULT NULL COMMENT '最后操作人ID，关联admin表'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE items
  ADD CONSTRAINT fk_items_operator
    FOREIGN KEY (operator_id) REFERENCES admin(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- 创建 transactions 表（出入库记录表）
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL COMMENT '物品ID，关联items表',
  operation_type TINYINT NOT NULL COMMENT '操作类型，1代表入库，0代表出库',
  quantity INT NOT NULL COMMENT '操作数量',
  handler_id INT DEFAULT NULL COMMENT '经手人ID，关联admin表',
  remark VARCHAR(255) COMMENT '备注',
  post_stock INT NOT NULL COMMENT '操作后库存',
  operation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE transactions
  ADD CONSTRAINT fk_transactions_item
    FOREIGN KEY (item_id) REFERENCES items(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE transactions
  ADD CONSTRAINT fk_transactions_handler
    FOREIGN KEY (handler_id) REFERENCES admin(id)
    ON DELETE SET NULL ON UPDATE CASCADE;