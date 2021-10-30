package controllers

import (
	"github.com/astaxie/beego"
)

type MainController struct {
	beego.Controller
}

func (c *MainController) Get() {
	c.Data["Hui"] = "beego.me"
	c.Data["Email"] = "suck@gmail.com"
	c.TplName = "index.tpl"
}
